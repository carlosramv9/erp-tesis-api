const { response, request } = require('express')
const { User } = require('../models')
const bcrypt = require('bcryptjs')
const { TokenGenerator } = require('./jwtGenerate')
const { badAuth, dataBase } = require('config').get('message')
const { logger } = require('../libs/logger')

/**
 * This method is for get a list of Users
 * @param {string} email  User Email
 * @param {string} password  User Password
 * @author Carlos Ramirez
 */

const login = async(req = request, res = response) => {
    logger.verbose('[Auth, login]', 'method to login into application')
    const { email, password } = req.body
    try {
        //Verificar que el email exista
        const user = await User.findOne({ email })

        if (!user || !user.status) return res.status(400).json(badAuth)
            //Verificar Contraseña
        const passwordValidation = bcrypt.compareSync(password, user.password)
        if (!passwordValidation) return res.status(400).json(badAuth)
            //Generar JWT
        const token = await TokenGenerator(user.id)
        res.json({ token, status: true })
    } catch (error) {
        logger.error('[Auth, login]', 'method to login into application')
        return res.status(500).json(dataBase)
    }
}

/**
 * This method is for get a list of Users
 * @param {string} id_token  from google front
 * @author Carlos Ramirez
 */

const googleSignin = (req = request, res = response) => {
    logger.verbose('[Auth, googleSignin]', 'google Auth')
    const { id_token } = req.body
    res.status(200).json({ msg: 'google signin ok!' })
}

module.exports = {
    login,
    googleSignin,
}