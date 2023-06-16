import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import { db, testDbConnection } from "./app/config/db.config.js";
import { config } from "dotenv";
config();
import Role from './app/models/role.model.js';


const tz = process.env.TZ || 'America/Argentina/Cordoba';
const app = express();
const entorno = process.env.NODE_ENV || 'dev';

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

app.use(morgan(entorno));
// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '50mb', extended: true }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

import './app/models/user.model.js';
import './app/models/role.model.js';
import './app/models/log.model.js';
import './app/models/provider.model.js';
import './app/models/category.model.js';
import './app/models/product.model.js';
import './app/models/userrole.model.js';
import './app/models/index.js';




// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to bezkoder application." });
});

// require('./app/routes/auth.routes')(app);
// require('./app/routes/user.routes')(app);

// Import routes
import authRoutes from "./app/routes/auth.routes.js";
import userRoutes from "./app/routes/user.routes.js";
import categoryRoutes from "./app/routes/category.routes.js";

app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);

app.use((req, res, next) => {
    req.timezone = tz; // Establece la zona horaria deseada
    next();
});

// set port, listen for requests
const server_port = process.env.API_PORT || 8082;
const server_host = process.env.API_HOST || '0.0.0.0';
const server_protocol = process.env.API_PROTOCOL || 'http';

const init = async() => {
    try {
        await testDbConnection();
        await db.sync({ alter: true });

        // await db.sync({ alter: true }).then(() => {
        //     console.log('Drop and Resync Db');
        //     initial();
        // })
        app.listen(server_port, server_host, () => console.log(`The server is running on: ${server_protocol}://${server_host}:${server_port} without problems`.green));
    } catch (error) {
        console.error(`Error trying to connect to the server: ${error}`.bgRed.white)
    }
}

init();

function initial() {
    Role.create({
        id: 1,
        name: "user"
    });

    Role.create({
        id: 2,
        name: "moderator"
    });

    Role.create({
        id: 3,
        name: "admin"
    });
}