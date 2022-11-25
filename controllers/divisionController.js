const { response, request } = require('express');
const dayjs = require('dayjs')
const { Division, Builder, TimeLine } = require('../models');
const { logger } = require('../libs/logger');
const ObjectId = require('mongoose').Types.ObjectId;
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate } = require('config').get('message');

/**
 * This method is for get a list of Divisions
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const divisionsGet = async(req = request, res = response) => {
    logger.verbose('[Divisions, divisionsGet]', 'Get Divisions List');
    const { page = 1, limit = 10, filter } = req.query;
    const query = [];

    var since = (limit * page) - limit

    if (filter) {
        const fields = ['name']
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

    if (parseInt(req.user.role.priority.split('p')[1]) > 5 || req.user.role.priority === 'default') {
        query.push({ closer: new ObjectId(req.user._id) })
    }

    if (query.length === 0) query.push({
        status: true
    })

    const [total, divisions] = await Promise.all([
        Division.countDocuments({ $or: query }),
        Division.find({ $or: query })
        .populate("closer")
        .populate("builder")
        .skip(Number(since))
        .limit(Number(limit))
    ])
    logger.debug(`Total Divisions: ${total}`)
    res.json({
        total,
        divisions
    });
};

/**
 * This method is for add a division by admin panel
 * @param {divisionData} req.body
 * @return {json} json String
 * @author Carlos Ramírez 
 */
const AddDivision = async(req, res = response) => {
    logger.verbose('[Divisions, AddDivision]', 'Create a division on the admin panel)')

    const { name, closer, builder, contacts, commission, commissionType } = req.body;
    logger.info(builder)

    const division = new Division({
        name,
        closer,
        builder,
        contacts,
        commission,
        commissionType
    });

    try {
        const save = await division.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'Division',
            actionBy: req.user._id,
            actionDescription: `Fraccionamiento ${save.name}  Creado`
        }
        TimeLine.create(event)
        logger.info('[Divisions, AddDivision] Add Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[Divisions, AddDivision]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is for add a division by admin panel
 * @param {divisionData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const AddDivisionAdmin = async(req, res = response) => {
    logger.verbose('[Divisions, AddDivisionAdmin]', 'Create a division on the admin panel)')

    const { name, address, builder, contacts } = req.body;

    const oBuilder = Builder.find(x => x.name === builder)
    logger.debug(oBuilder)

    const division = new Division({ name, address, contacts, buildedBy: '' });

    logger.debug(division);

    try {
        const save = await division.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'Division',
            actionBy: req.user._id,
            actionDescription: `Fraccionamiento ${save.firstName} Creado`
        }
        TimeLine.create(event)
        logger.info('[Divisions, AddDivisionAdmin] Add by Admin Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[Divisions, AddDivisionAdmin]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is to update a division by id
 * @param {MongoId} idDivision
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const updateDivisionByAdmin = async(req, res = response) => {
    logger.verbose('[Divisions, updateDivisionByAdmin]', 'Update division by admin')
    const {
        id
    } = req.params;
    logger.debug(`Division _id: ${id}`)
    const rest = req.body;
    try {
        const update = await Division.findByIdAndUpdate(id, rest)

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Division',
            actionBy: req.user._id,
            actionDescription: `Fraccionamiento ${update.firstName} Actualizado por Administrador`
        }
        TimeLine.create(event)
        logger.info('[Divisions, updateDivisionByAdmin] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Divisions,updateDivisionByAdmin]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to active a division by id
 * @param {MongoId} idDivision 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const divisionsDelete = async(req, res = response) => {
    logger.verbose('[Divisions, divisionsDelete]', 'Delete a division by id');
    const {
        id
    } = req.params;
    logger.debug(`Division _id: ${id}`);
    try {
        await Division.findByIdAndUpdate(id, {
            status: false
        });
        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'Division',
            actionBy: req.user._id,
            actionDescription: `Fraccionamiento ${response.firstName} Eliminado`
        }
        await TimeLine.create(event)
        logger.info('[Divisions, divisionsDelete] Successfully Removed')
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[Divisions,divisionsDelete]', err);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to delete a division by id
 * @param {MongoId} idDivision 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const activeDivision = (req, res = response) => {
    logger.verbose('[Divisions, activeDivision]', 'Active a division by id');
    const {
        id
    } = req.params;
    logger.debug(`Division _id: ${id}`);
    Division.findByIdAndUpdate(id, {
            status: true
        })
        .then(division => {
            if (!division) return res.status(500).json(entityNoExists)
            const event = {
                date: dayjs().toDate(),
                actionType: 'ACTIVE',
                target: 'Division',
                actionBy: req.user._id,
                actionDescription: `Fraccionamiento ${response.firstName} activated`
            }
            TimeLine.create(event)
        })
        .catch(err => {
            logger.error('[Divisions,activeDivision]', err);
            res.status(500).json(dataBase);
        })
}

module.exports = {
    divisionsGet,
    AddDivisionAdmin,
    activeDivision,
    divisionsDelete,
    AddDivision,
    updateDivisionByAdmin
}