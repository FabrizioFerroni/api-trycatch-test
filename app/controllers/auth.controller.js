import { db } from "../config/db.config.js";
import Role from '../models/role.model.js';
import User from '../models/user.model.js';
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Sequelize } from "sequelize";
import { sendMail } from '../mails/config.mails.js';
import { generateToken } from "../helpers/generateTokens.helpers.js";
import { genUsername } from "../helpers/generateUsers.helpers.js";
import moment from "moment-timezone";

const Op = db.Sequelize.Op;
const secret = process.env.JWT_SECRET || "";
const front = process.env.HOST_FRONT_EMAIL;
const invalidTokens = [];

export async function register(req, res) {
    // Save User to Database
    const { name, lastname, email, password, avatar, roles } = req.body;
    let username = await genUsername(name, lastname);
    let token_user = generateToken(60);
    let link = `${front}/auth/verify/${token_user}`;

    let body = {
        name: name,
        link: link
    };
    // 
    try {
        let hoy = new Date();
        const user = await User.create({
            name: name,
            lastname: lastname,
            username: username,
            email: email,
            token: token_user,
            caducidad_token: hoy.setDate(hoy.getDate() + 1),
            password: bcrypt.hashSync(password, 8)
        });

        let userRoles = [];
        if (roles) {
            userRoles = await Role.findAll({
                where: {
                    name: {
                        [Op.or]: roles
                    }
                }
            });
        } else {
            // user role = 1
            const role = await Role.findByPk(1);
            userRoles.push(role);
        }

        await user.setRoles(userRoles);

        if (user) sendMail(email, 'Verify Email Address', 'confirm', body);

        res.send({ message: "User was registered successfully! Please check your email to verify your account" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

export function login(req, res) {
    const { username, email, password } = req.body;
    User.findOne({
            where: Sequelize.literal(`email = '${email}' OR username = '${username}'`),
        })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            let passwordIsValid = bcrypt.compareSync(
                password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    message: "Invalid username or password please try again"
                });
            }

            let authorities = [];
            user.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }

                let token = Jwt.sign({ id: user.id, username: user.username, roles: authorities }, secret, { expiresIn: '1d' });
                res.status(200).send({
                    id: user.id,
                    name: user.name,
                    lastname: user.lastname,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token
                });
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

export async function refreshToken(req, res) {
    try {
        const { oldToken } = req.body;
        const decoded = Jwt.verify(oldToken, secret);
        const userId = decoded.id;

        if (oldToken === undefined || oldToken === null || oldToken === '') {
            return res.status(404).send({ message: 'The token cannot be null' });
        }

        // Verificar si el token anterior está en la lista de tokens inválidos
        if (invalidTokens.includes(oldToken)) {
            return res.status(401).send({ message: 'Invalid Token' });
        }

        User.findOne({
                where: {
                    id: userId
                },
            })
            .then(user => {
                if (!user) {
                    return res.status(404).send({ message: "User Not found." });
                }


                let authorities = [];
                user.getRoles().then(roles => {
                    for (let i = 0; i < roles.length; i++) {
                        authorities.push("ROLE_" + roles[i].name.toUpperCase());
                    }

                    let newToken = Jwt.sign({ id: user.id, username: user.username, roles: authorities }, secret, { expiresIn: '1d' });

                    // Invalidar el token anterior y agregarlo a la lista de tokens inválidos
                    invalidTokens.push(oldToken);

                    return res.status(200).send({ refresh_token: newToken });
                });
            })
            .catch(err => {
                res.status(500).send({ message: err.message });
            });

    } catch (error) {
        console.error('Failed to renew token:', error);
        return res.status(500).send({ message: 'Failed to renew token' });
    }
}

export async function verify(req, res) {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            where: { token }
        });

        if (user.email_verified_at !== null) return res.status(200).send({ message: "Email already verified" });

        if (user) {
            try {
                let fechaActual = new Date();

                if (fechaActual <= user.caducidad_token) {
                    user.email_verified_at = new Date();
                    user.token = null;
                    user.caducidad_token = null;
                    let userUpdate = await user.save();
                    if (userUpdate) {
                        return res.status(200).send({ message: "Email verified successfully!" });
                    } else {
                        return res.status(500).send({ message: "Could not verify account" });
                    }
                } else {
                    let token_user = generateToken(60);
                    let link = `${front}/auth/verify/${token_user}`;
                    let body = {
                        name: user.name,
                        link: link
                    };
                    let hoy = new Date();
                    user.token = token_user;
                    user.caducidad_token = hoy.setDate(hoy.getDate() + 1);
                    let userUpdate = await user.save();
                    if (userUpdate) {
                        sendMail(user.email, 'Re-Verify Email Address', 'reconfirm', body);
                        return res.status(200).send({ message: "An email was sent to you to confirm your account again because your grace time expired." });
                    } else {
                        return res.status(500).send({ message: "Could not send to re-verify account" });
                    }
                }
            } catch (error) {
                console.error('Failed to update user:', error);
                return res.status(500).send({ message: 'Failed to update user' });
            }
        } else {
            return res.status(404).send({ message: 'No user found with the entered token' });
        }
    } catch (error) {
        console.error('Failed to verify token:', error);
        return res.status(500).send({ message: 'Failed to verify token' });
    }
}

export async function forgotPassword(req, res) {
    try {
        const { userBody } = req.body;
        const user = await User.findOne({
            where: Sequelize.literal(`email = '${userBody}' OR username = '${userBody}'`),
        });

        if (user) {
            let token = generateToken(60);
            let link = `${front}/auth/recovery-password/${token}`;
            let body = {
                name: user.name,
                username: user.username,
                link: link,
                year: new Date().getFullYear()
            };
            let horaActual = new Date();

            user.token = token;
            user.caducidad_token = horaActual.setMinutes(horaActual.getMinutes() + 60);
            let userUpdate = await user.save();
            if (userUpdate) {
                sendMail(user.email, 'Reset Password', 'forgot', body);
                return res.status(200).send({ message: "An email was sent to you to change your password account." });
            }
        } else {
            console.log(`Se encontro un usuario`.bgWhite.red);
            return res.status(404).send({ message: 'No user found with the entered token' });
        }
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

export async function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            where: { token }
        });
        if (user) {
            try {
                let fechaActual = new Date();

                if (fechaActual <= user.caducidad_token) {
                    user.password = bcrypt.hashSync(password, 8)
                    user.token = null;
                    user.caducidad_token = null;
                    let userUpdate = await user.save();
                    if (userUpdate) {
                        return res.status(200).send({ message: "Password changed successfully!" });
                    } else {
                        return res.status(500).send({ message: "Could not changed password 😣" });
                    }
                } else {
                    let token = generateToken(60);
                    let link = `${front}/auth/recovery-password/${token}`;
                    let body = {
                        name: user.name,
                        username: user.username,
                        link: link,
                        year: new Date().getFullYear()
                    };
                    let horaActual = new Date();

                    user.token = token;
                    user.caducidad_token = horaActual.setMinutes(horaActual.getMinutes() + 60);
                    let userUpdate = await user.save();
                    if (userUpdate) {
                        sendMail(user.email, 'Reset Password', 'forgot', body);
                        return res.status(200).send({ message: "An email was sent to you to change your password account." });
                    } else {
                        return res.status(500).send({ message: "Could not send to re-forgot password" });
                    }
                }
            } catch (error) {
                console.error('Failed to update user:', error);
                return res.status(500).send({ message: 'Failed to update user' });
            }
        } else {
            return res.status(404).send({ message: 'No user found with the entered token' });
        }
    } catch (error) {
        console.error('Failed to verify token:', error);
        return res.status(500).send({ message: 'Failed to verify token' });
    }

}

export async function reactiveUser(req, res) {
    try {
        const { userBody } = req.body;
        const user = await User.findOne({
            where: Sequelize.literal(`email = '${userBody}' OR username = '${userBody}'`),
        });

        let token_user = generateToken(60);
        let link = `${front}/auth/verify/${token_user}`;
        let body = {
            name: user.name,
            link: link
        };
        let hoy = new Date();
        user.token = token_user;
        user.caducidad_token = hoy.setDate(hoy.getDate() + 1);
        let userUpdate = await user.save();
        if (userUpdate) {
            sendMail(user.email, 'Re-Verify Email Address', 'reconfirm', body);
            return res.status(200).send({ message: "An email was sent to you to confirm your account again because your grace time expired." });
        } else {
            return res.status(500).send({ message: "Could not send to re-verify account" });
        }
    } catch (error) {
        console.error('Failed to verify token:', error);
        return res.status(500).send({ message: 'Failed to verify token' });
    }
}