require('dotenv').config({
    path: `./env/.env.${process.env.NODE_ENV}`
});

const { Server } = require('./models')

const server = new Server();

server.listen();