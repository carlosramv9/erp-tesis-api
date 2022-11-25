const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { notAuth } = require('config').get('message');
const { logger } = require('../libs/logger');

/**
 * This middleware is for validate users token 
 * @return {string} token
 * @author Gabriel Murillo
 */
const jwtValidation = async(req = request, res = response, next) => {
    const token = req.header('xtoken')
    if (!token) return res.status(401).json({ msg: 'Petition without token' });
    logger.info('[middlewares, jwtValidation], jwt: ' + token)
    try {
        const { uid } = await jwt.verify(token, process.env.SECRETPRIVATEKEY);
        AuthUser = await User.findById(uid).populate('role', '-__v');
        if (!AuthUser) return res.status(401).json(notAuth)

        if (!AuthUser.status) return res.status(401).json(notAuth);
        req.user = AuthUser;
        logger.silly("Authenticated user: ", req.user);
        next();
    } catch (error) {
        logger.error('(middlewares, jwtValidation)', error);
        res.status(401).json(notAuth)
    }

};

module.exports = {
    jwtValidation
}