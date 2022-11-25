const express = require('express');
const cors = require('cors');
const { connection } = require('../database/config');
const { logger } = require('../libs/logger');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.paths = {
            auth: '/auth',
            users: '/users',
            roles: '/roles',
            customers: '/customers',
            properties: '/properties',
            publicProperties: '/public/properties',
            builders: '/builders',
            divisions: '/divisions',
            categories: '/categories',
            models: '/models',
            process: '/process',
            processTemplate: '/template/process',
            utils: '/utils',
            timeline: '/timeline',
            blog: '/blog',
            bankCredits: '/bank-credits',
            banks: '/banks',
            bankMovement: '/bankMovements',
            investor: '/investors',
            dashboard: '/dashboard',
        }

        //Connect Data Base
        this.connectDB();
        //Middlewares
        this.middlewares();
        //Routes
        this.routes();
    }

    async connectDB() {
        await connection();
    }

    middlewares() {
        //Cors
        this.app.use(cors());
        //Read 
        this.app.use(express.json());
        //Views
        this.app.use(express.static('views'));
    }

    routes() {
        this.app.use(this.paths.auth, require('../routes/authRoutes'));
        this.app.use(this.paths.users, require('../routes/usersRoutes'));
        this.app.use(this.paths.roles, require('../routes/rolesRoutes'));
        this.app.use(this.paths.customers, require('../routes/customersRoutes'));
        this.app.use(this.paths.properties, require('../routes/propertiesRoutes'));
        this.app.use(this.paths.builders, require('../routes/buildersRoutes'));
        this.app.use(this.paths.divisions, require('../routes/divisionsRoutes'));
        this.app.use(this.paths.categories, require('../routes/categoriesRoutes'));
        this.app.use(this.paths.processTemplate, require('../routes/processTemplateRoutes'));
        this.app.use(this.paths.models, require('../routes/buildModelsRoutes'));
        this.app.use(this.paths.process, require('../routes/processRoutes'));
        this.app.use(this.paths.utils, require('../routes/utilsRoutes'));
        this.app.use(this.paths.dashboard, require('../routes/dashboardRoutes'));
        this.app.use(this.paths.bankCredits, require('../routes/bankCreditsRoutes'));
    }

    listen() {
        this.app.listen(this.port, () => {
            logger.info('Listen at :', this.port);
        });
    }

}

module.exports = Server;