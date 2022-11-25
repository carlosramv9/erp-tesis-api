const jwt = require('jsonwebtoken');
const { logger } = require('../libs/logger');
//Generate Token Like a Promise
const TokenGenerator = (uid = '') => {
    return new Promise((resolve, reject) => {

        const payload = { uid };
        jwt.sign(payload, process.env.SECRETPRIVATEKEY, {
            expiresIn: '4h'
        }, (err, token) => {
            if (err) {
                logger.error('[jwt, Token Generator]', err);
                reject('No se pudo generar el token')
            } else {
                resolve(token);
            }
        })
    })
}

module.exports = {
    TokenGenerator
}