const { response, request } = require('express');
const dayjs = require('dayjs')
const { Customer, Property } = require('../models');
const { logger } = require('../libs/logger');
const { process } = require('config').get('timeLineTargets')
const { create, update, remove, active } = require('config').get('timeLineActionType')
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate, paramsError } = require('config').get('message');
const DEFAULT_ROLE = 'DEFAULT_ROLE';

/**
 * This method is for get a list of process
 * @param {number} page
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramirez
 */

const getLatestCustomers = async(req, res = response) => {
    logger.verbose('[dashboard, getLatestCustomers]', 'List Customers');
    const { limit = 30 } = req.query;

    let lateDate = new Date();
    lateDate.setDate(lateDate.getDate() - limit);
    let currentDate = new Date()

    let query = [{ registedDate: { $gte: lateDate, $lte: currentDate } }]
    if (parseInt(req.user.role.priority.split('p')[1]) > 5 || req.user.role.priority === 'default') {
        query.push({ idEmployee: new ObjectId(req.user._id) })
    }

    const [total, customers] = await Promise.all([
        Customer.countDocuments({ $and: query }),
        Customer.find({ $and: query })
    ])
    logger.debug(`Total Latest Customers: ${total}`);

    logger.info('[dashboard, getLatestCustomers]', 'successfully');
    res.json({ total, customers, status: true });
}

/**
 * This method is for get a list of process
 * @param {number} page
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramirez
 */

const getPastDueProperties = async(req, res = response) => {
    logger.verbose('[dashboard, getPastDueProperties]', 'List Customers');
    const { limit = 30 } = req.query;

    let lateDate = new Date();
    lateDate.setDate(lateDate.getDate() - limit);

    let query = [{ registerDate: { $lte: lateDate } }]
    if (parseInt(req.user.role.priority.split('p')[1]) > 5 || req.user.role.priority === 'default') {
        query.push({ idEmployee: new ObjectId(req.user._id) })
    }

    const [total, properties] = await Promise.all([
        Property.countDocuments({ $and: query }),
        Property.find({ $and: query })
    ])
    logger.debug(`Total past Due Properties: ${total}`);

    logger.info('[dashboard, getPastDueProperties]', 'successfully');
    res.json({ total, properties, status: true });
}

module.exports = {
    getLatestCustomers,
    getPastDueProperties
}