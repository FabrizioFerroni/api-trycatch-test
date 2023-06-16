import { DataTypes } from "sequelize";
import { db } from "../config/db.config.js";


const Role = db.define(
    "role", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
    }, {
        timestamps: true
    }
);
export default Role;