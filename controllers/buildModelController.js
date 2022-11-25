const { response, request } = require('express');
const dayjs = require('dayjs')
const { BuildModel, TimeLine } = require('../models');
const { logger } = require('../libs/logger');
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate } = require('config').get('message');

/**
 * This method is for get a list of BuildModels
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const buildModelsGet = async (req = request, res = response) => {
    logger.verbose('[BuildModels, buildModelsGet]', 'Get Build Models List');
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

    const [total, buildModels] = await Promise.all([
        BuildModel.countDocuments({ $or: query }),
        BuildModel.find({ $or: query })
            .populate("division")
            .skip(Number(since))
            .limit(Number(limit))
    ])
    logger.debug(`Total Models: ${total}`)
    res.json({
        total,
        buildModels
    });
};

/**
 * This method is for add a buildModel by admin panel
 * @param {buildModelData} req.body
 * @return {json} json String
 * @author Carlos Ramírez 
 */
const AddBuildModel = async (req, res = response) => {
    logger.verbose('[BuildModels, AddBuildModel]', 'Create a buildModel on the admin panel)')

    const { name, description, division,
        floors,
        bedrooms,
        bathrooms,
        halfbathrooms,
        type,
    } = req.body;
    const buildModel = new BuildModel({
        name, description, division,
        floors,
        bedrooms,
        bathrooms,
        halfbathrooms,
        type,
        createdBy: req.user._id, });

    logger.debug(buildModel);

    try {
        const save = await buildModel.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'models',
            actionBy: req.user._id,
            actionDescription: `Modelo de Construcción ${save.name} Creado`
        }
        TimeLine.create(event)
        logger.info('[BuildModels, AddBuildModel] Add Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[BuildModels, AddBuildModel]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is for add a buildModel by admin panel
 * @param {buildModelData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const AddBuildModelAdmin = async (req, res = response) => {
    logger.verbose('[BuildModels, AddBuildModelAdmin]', 'Create a buildModel on the admin panel)')

    const { name, description,
        floors,
        bedrooms,
        bathrooms,
        halfbathrooms, } = req.body;
    const buildModel = new BuildModel({
        name, description,
        floors,
        bedrooms,
        bathrooms,
        halfbathrooms, });

    logger.debug(buildModel);

    try {
        const save = await buildModel.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'models',
            actionBy: req.user._id,
            actionDescription: `Modelo de Construcción ${save.name} Creado por Administrador`
        }
        TimeLine.create(event)
        logger.info('[BuildModels, AddBuildModelAdmin] Add by Admin Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[BuildModels, AddBuildModelAdmin]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is to update a buildModel by id
 * @param {MongoId} idBuildModel
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const updateBuildModelByAdmin = async (req, res = response) => {
    logger.verbose('[BuildModels, updateBuildModelByAdmin]', 'Update buildModel by admin')
    const {
        id
    } = req.params;
    logger.debug(`BuildModel _id: ${id}`)
    const rest = req.body;
    try {
        const update = await BuildModel.findByIdAndUpdate(id, rest)

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'models',
            actionBy: req.user._id,
            actionDescription: `Modelo de Construcción ${update.name} actualizado por Administrador`
        }
        TimeLine.create(event)
        logger.info('[BuildModels, updateBuildModelByAdmin] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[BuildModels,updateBuildModelByAdmin]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to active a buildModel by id
 * @param {MongoId} idBuildModel 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const buildModelsDelete = async (req, res = response) => {
    logger.verbose('[BuildModels, buildModelsDelete]', 'Delete a build Model by id');
    const {
        id
    } = req.params;
    logger.debug(`Build Model _id: ${id}`);
    try {
        await BuildModel.findByIdAndUpdate(id, {
            status: false
        });
        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'models',
            actionBy: req.user._id,
            actionDescription: `Modelo de Construcción ${response.name} Eliminado`
        }
        await TimeLine.create(event)
        logger.info('[BuildModels, buildModelsDelete] Successfully Removed')
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[BuildModels,buildModelsDelete]', err);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to delete a buildModel by id
 * @param {MongoId} idBuildModel 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const activeBuildModel = (req, res = response) => {
    logger.verbose('[BuildModels, activeBuildModel]', 'Active a build Model by id');
    const {
        id
    } = req.params;
    logger.debug(`BuildModel _id: ${id}`);
    BuildModel.findByIdAndUpdate(id, {
        status: true
    })
        .then(buildModel => {
            if (!buildModel) return res.status(500).json(entityNoExists)
            const event = {
                date: dayjs().toDate(),
                actionType: 'ACTIVE',
                target: 'models',
                actionBy: req.user._id,
                actionDescription: `Modelo de Construcción ${response.name} Restaurado`
            }
            TimeLine.create(event)
        })
        .catch(err => {
            logger.error('[BuildModels,activeBuildModel]', err);
            res.status(500).json(dataBase);
        })
}

module.exports = {
    buildModelsGet,
    AddBuildModelAdmin,
    activeBuildModel,
    buildModelsDelete,
    AddBuildModel,
    updateBuildModelByAdmin
}