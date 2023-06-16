import Jwt from "jsonwebtoken";
import User from '../models/user.model.js';
import moment from 'moment';

const secret = process.env.JWT_SECRET || "";

export function verifyToken(req, res, next) {
    const { authorization } = req.headers;

    if (!authorization) return res.status(403).send({ message: `You don't have sent a token` });

    let token = authorization.replace(/['"]+/g, '');

    let seg = token.split('.');

    if (seg.length != 3) {
        return res.status(403).send({ message: 'Invalid Token' });
    } else {
        try {
            const payload = Jwt.decode(token, secret);
            if (payload.exp <= moment().unix()) {
                return res.status(403).send({ message: 'Expired Token' });
            }
        } catch (error) {
            return res.status(403).send({ message: 'Invalid Token' });
        }
    }

    Jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        req.username = decoded.username;
        isVerified(req, res, next);
    });
};


function isVerified(req, res, next) {
    User.findByPk(req.userId).then(user => {
        if (user.email_verified_at === null) {
            return res.status(401).send({
                message: "You have not verified your account. Please verify your account, check if you have the email in your box"
            });
        }
        next();
    });
}
export function isAdmin(req, res, next) {
    User.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }

            res.status(403).send({
                message: "Require Admin Role!"
            });
            return;
        });
    });
};

export function isModerator(req, res, next) {
    User.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "moderator") {
                    next();
                    return;
                }
            }

            res.status(403).send({
                message: "Require Moderator Role!"
            });
        });
    });
};

export function isModeratorOrAdmin(req, res, next) {
    User.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "moderator") {
                    next();
                    return;
                }

                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }

            res.status(403).send({
                message: "Require Moderator or Admin Role!"
            });
        });
    });
};