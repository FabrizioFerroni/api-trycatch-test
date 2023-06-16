import { Sequelize } from "sequelize";
import { db } from "../config/db.config.js";
import Role from '../models/role.model.js';
import User from '../models/user.model.js';

const verificarDisponibilidadUsuario = async(nombreUsuario) => {
    try {
        const usuario = await User.findOne({
            where: {
                username: nombreUsuario,
            }
        });
        return !usuario;
    } catch (error) {
        throw error;
    }
};

export const genUsername = async(nombres, apellido) => {
    let iniciales = nombres.split(" ").map(nombre => nombre.charAt(0));
    let apellidos = apellido.split(" ");
    let nombreApellido = iniciales.join("") + apellidos.join("");

    let randomNum = ~~(Math.random() * 1000);

    while (!(await verificarDisponibilidadUsuario(nombreApellido.toLowerCase()))) {
        nombreApellido = (nombres.charAt(0) + apellidos.join("") + randomNum).toLowerCase();
        randomNum++;
    }

    return nombreApellido.toLowerCase();
};