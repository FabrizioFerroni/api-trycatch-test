import Sequelize from "sequelize";
import colors from "colors";
import { config } from "dotenv";
config();


const uri = process.env.DB_URI || 'postgres://postgres:@localhost:5432/inventario';
const username = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASS || '';
const database = process.env.DB_NAME || 'inventario';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 5432;
const dialect = process.env.DB_DIALECT || 'postgres';
const entorno = process.env.NODE_ENV || 'dev';
let configDB = {} || '';

if (entorno === 'dev') {
    configDB = {
        database: database,
        username: username,
        password: password,
        host: host,
        dialect: dialect,
        port: port,
        logging: false,
    };
}

if (entorno === 'prod') {
    configDB = uri;
}

export const db = new Sequelize(configDB);

export const testDbConnection = async() => {
    try {
        await db.authenticate();
        console.log("Connection has been established successfully.".bgGreen.white);
    } catch (error) {
        console.error("Unable to connect to the database: \n".bgRed.black, error);
    }
};