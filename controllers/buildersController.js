const { response, request } = require('express');
const dayjs = require('dayjs')
const { Builder, TimeLine } = require('../models');
const { logger } = require('../libs/logger');
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate } = require('config').get('message');

/**
 * This method is for get a list of Builders
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const buildersGet = async(req = request, res = response) => {
    logger.verbose('[Builders, buildersGet]', 'Get Builders List');
    const { page = 1, limit = 10, filter } = req.query;
    const query = [];

    var since = (limit * page) - limit

    if (filter) {
        const fields = ['name']
        logger.debug(filter)
        for (let index = 0; index < fields.length; index++) {
            var field = {
                [fields[index]]: {
                    $regex: filter,
                    $options: 'i'
                },
                status: true
            }
            query.push(field)
        }
    }

    if (query.length === 0) query.push({
        status: true
    })

    const [total, builders] = await Promise.all([
        Builder.countDocuments({ $or: query }),
        Builder.find({ $or: query })
        .skip(Number(since))
        .limit(Number(limit))
    ])
    logger.debug(`Total Builders: ${total}`)
    res.json({
        total,
        builders
    });
};

/**
 * This method is for add a builder by admin panel
 * @param {builderData} req.body
 * @return {json} json String
 * @author Carlos Ramírez 
 */
const AddBuilder = async(req, res = response) => {
    logger.verbose('[Builders, AddBuilder]', 'Create a builder on the admin panel)')

    const { name } = req.body;
    const builder = new Builder({
        name,
    });

    logger.debug(builder);

    try {
        const save = await builder.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'Builder',
            actionBy: req.user._id,
            actionDescription: `Constructora ${save.name} Creada`
        }
        TimeLine.create(event)
        logger.info('[Builders, AddBuilder] Add Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[Builders, AddBuilder]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is for add a builder by admin panel
 * @param {builderData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const AddBuilderAdmin = async(req, res = response) => {
    logger.verbose('[Builders, AddBuilderAdmin]', 'Create a builder on the admin panel)')

    const {
        name,
    } = req.body;
    const builder = new Builder({
        name,
    });

    logger.debug(builder);

    try {
        const save = await builder.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'Builder',
            actionBy: req.user._id,
            actionDescription: `Constructora ${save.name} creada por Administrador`
        }
        TimeLine.create(event)
        logger.info('[Builders, AddBuilderAdmin] Add by Admin Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[Builders, AddBuilderAdmin]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is to update a builder by id
 * @param {MongoId} idBuilder
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const updateBuilderByAdmin = async(req, res = response) => {
    logger.verbose('[Builders, updateBuilderByAdmin]', 'Update builder by admin')
    const {
        id
    } = req.params;
    logger.debug(`Builder _id: ${id}`)
    const rest = req.body;
    try {
        const update = await Builder.findByIdAndUpdate(id, rest)

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Builder',
            actionBy: req.user._id,
            actionDescription: `Constructora ${update.name} actualizada por Administrador`
        }
        TimeLine.create(event)
        logger.info('[Builders, updateBuilderByAdmin] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Builders,updateBuilderByAdmin]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to active a builder by id
 * @param {MongoId} idBuilder 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const buildersDelete = async(req, res = response) => {
    logger.verbose('[Builders, buildersDelete]', 'Delete a builder by id');
    const {
        id
    } = req.params;
    logger.debug(`Builder _id: ${id}`);
    try {
        await Builder.findByIdAndUpdate(id, {
            status: false
        });
        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'Builder',
            actionBy: req.user._id,
            actionDescription: `Constructora ${response.name} Eliminada`
        }
        await TimeLine.create(event)
        logger.info('[Builders, buildersDelete] Successfully Removed')
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[Builders,buildersDelete]', err);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to delete a builder by id
 * @param {MongoId} idBuilder 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const activeBuilder = (req, res = response) => {
    logger.verbose('[Builders, activeBuilder]', 'Active a builder by id');
    const {
        id
    } = req.params;
    logger.debug(`Builder _id: ${id}`);
    Builder.findByIdAndUpdate(id, {
            status: true
        })
        .then(builder => {
            if (!builder) return res.status(500).json(entityNoExists)
            const event = {
                date: dayjs().toDate(),
                actionType: 'ACTIVE',
                target: 'Builder',
                actionBy: req.user._id,
                actionDescription: `Constructora ${response.name} Restaurada`
            }
            TimeLine.create(event)
        })
        .catch(err => {
            logger.error('[Builders,activeBuilder]', err);
            res.status(500).json(dataBase);
        })
}

module.exports = {
    buildersGet,
    AddBuilderAdmin,
    activeBuilder,
    buildersDelete,
    AddBuilder,
    updateBuilderByAdmin
}