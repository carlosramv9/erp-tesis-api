const { response, request } = require('express');
const { logger } = require('../libs/logger');
const { badCredentials, notAuth } = require('config').get('message');
const { Role } = require('../models/index')

const ADMIN_ROLE = 'ADMIN_ROLE';

const UserRole = (...role) => {
    return (req = request, res = response, next) => {

        if (!req.user) return res.status(500).json(notAuth)
        if (!role.includes(req.user.role)) return res.status(401).json(badCredentials)
        next();
    }
}

const permission = (permission, route) => {
    return async(req = request, res = response, next) => {
        if (!req.user) return res.status(500).json(notAuth)
        if (!req.user.role) return res.status(500).json(notAuth)
        const role = await Role.findById(req.user.role)
        if (!role) return res.status(500).json(notAuth)
        if (!role[permission]?.lenght < 0 && !role.role != ADMIN_ROLE) return res.status(500).json(notAuth)
        if (!role[permission].includes(route) && role.role !== ADMIN_ROLE) return res.status(401).json(badCredentials)
        next();
    }
}


module.exports = {
    UserRole,
    permission
}