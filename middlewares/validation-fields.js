const { validationResult } = require('express-validator');
const { logger } = require('../libs/logger');
const validationFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('(validation-fields)', errors)
        return res.status(400).json({ errors, status: false })
    }
    next();
}

const validationFieldsFormData = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('(validation-fields)', errors)
        return res.status(400).json({ errors, status: false })
    }
    next();
}

module.exports = {
    validationFields,
    validationFieldsFormData
}