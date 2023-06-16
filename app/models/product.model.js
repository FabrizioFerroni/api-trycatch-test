import { DataTypes } from "sequelize";
import { db } from "../config/db.config.js";

const Product = db.define(
    'product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(16, 2),
            allowNull: false
        },
        image: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        public_id: {
            type: DataTypes.STRING(150),
            allowNull: true
        }
    }, {
        timestamps: true
    }
);

export default Product;