const { response, request } = require('express');
const dayjs = require('dayjs')
const { Role, TimeLine } = require('../models');
const { logger } = require('../libs/logger');
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate, paramsError } = require('config').get('message');


/**
 * This method is for get a list of Users
 * @param {number} page
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramirez
 */

const rolesList = async(req = request, res = response) => {
    logger.verbose('[Roles, rolesList]', 'Get Roles List');
    let page = req.query.page || 1;
    const { limit = 10 } = req.query;
    page = page - 1;
    const since = page * limit;

    const [total, roles] = await Promise.all([
        Role.countDocuments(),
        Role.find()
        .skip(Number(since))
        .limit(Number(limit))
    ])
    const complete = await Role.find();
    logger.debug(`Total Roles: ${total}`);
    res.json({ total, roles, complete });
};

/**
 * This method is for add a role by admin panel
 * @param {roleData} req.body
 * @return {json} json String
 * @author Carlos Ramirez 
 */

const newRole = async(req, res = response) => {
    logger.verbose('[Roles, newRole]', 'Create a new Role)')
    const { role = '', createPermisions = [], readPermisions = [], updatePermisions = [], deletePermisions = [] } = req.body;
    try {
        const newRole = new Role({ role, createPermisions, readPermisions, updatePermisions, deletePermisions })
        logger.debug(newRole);
        await newRole.save();
        logger.info('[pickRecord, Success New Role Added]');
        res.json(entityCreate)
    } catch (error) {
        logger.error('[Roles, newRole]', error)
        res.json(dataBase)
    }
}

/**
 * This method is for update an existing Role by Admin
 * @param {roleData} req.body
 * @return {json} json String
 * @author Carlos Ramirez 
 */
const updateRole = async(req, res = response) => {
    logger.verbose('[Roles, updateRole]', 'Create a new Role)')
    const { id } = req.params;
    const {...roleData } = req.body;
    logger.debug(roleData);
    try {
        await Role.findByIdAndUpdate({ _id: id }, roleData);
        logger.info('[Roles, updateRole,]', ' Success role updated');
        res.json(entityUpdate)
    } catch (error) {
        logger.error('[Roles, updateRole]', error)
        res.json(dataBase)
    }
}

const deleteRole = async(req, res = response) => {
    logger.verbose('[Role, deleteRole]', 'Delete a role by id');
    const { id } = req.params;
    logger.info(`Role _id: ${id}`);
    try {
        const role = await Role.findOneAndDelete({ _id: id })

        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'Role',
            actionBy: req.user._id,
            actionDescription: `Rol ${role.role} eliminado`
        }

        logger.info('[Role, deleteRole], role deleted Successfully')
        await TimeLine.create(event)
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[Role, deleteRole]', error);
        res.status(500).json(dataBase);
    }
}

module.exports = {
    newRole,
    rolesList,
    updateRole,
    deleteRole
}