const { response, request } = require('express');
const dayjs = require('dayjs')
const { TimeLine, ProcessTemplate } = require('../models');
const { logger } = require('../libs/logger');
const { processTemplate } = require('config').get('timeLineTargets')
const { create, update, remove, active } = require('config').get('timeLineActionType')
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate, paramsError } = require('config').get('message');
const DEFAULT_ROLE = 'DEFAULT_ROLE';

/**
 * This method is for get a list of process Templates
 * @param {number} page
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramirez
 */

const listProcessTemplate = async(req, res = response) => {
    logger.verbose('[processTemplate, listProcessTemplate]', 'List process templates');
    let page = req.query.page ? req.query.page - 1 : 1;
    const { limit = 10 } = req.query;
    const since = page * limit;

    const [total, processTemplates] = await Promise.all([
        ProcessTemplate.countDocuments({ isActive: true }),
        ProcessTemplate.find({ isActive: true })
        .select('-steps')
        .skip(Number(since))
        .limit(Number(limit))
        .populate('createdBy')
    ])
    logger.debug(`Total Process Templates: ${total}`);
    logger.info('[processTemplate, listProcessTemplate]', 'successfully')
    res.json({ total, processTemplates, status: true });
}

/**
 *
 * @param {number} page
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json Stringx
 * @author Carlos Ramirez
 */

const getProcessTemplateById = async(req = request, res = response) => {
    logger.verbose('[processTemplate, getProcessTemplateById]', 'Get process template id');

    const { processTemplateId } = req.params;
    try {
        const processTemplate = await ProcessTemplate.findById(processTemplateId).populate('createdBy', '-__v');
        if (!processTemplate) return res.json(entityNoExists);
        logger.info('[processTemplate, newProcessTemplate]', 'Success');
        return res.json(processTemplate);
    } catch (error) {
        logger.error('[processTemplate, newProcessTemplate]', error)
        return res.json(dataBase);
    }
}

/**
 * This method is for add a a new processTemplate
 * @param {processTemplateData} req.body
 * @return {json} json String
 * @author Carlos Ramirez 
 */

const newProcessTemplate = async(req, res = response) => {
    logger.verbose('[processTemplate, newProcessTemplate]', 'Create a new processTemplate');
    const { name, type, paymentMethod, steps, description } = req.body;

    const processTemplateData = {
        name,
        type,
        paymentMethod,
        steps,
        totalSteps: steps.length,
        createdBy: req.user._id,
        description
    }
    try {
        const newProcessTemplate = new ProcessTemplate(processTemplateData);
        await newProcessTemplate.save();

        const event = {
            date: dayjs().toDate(),
            actionType: create,
            target: processTemplate,
            actionBy: req.user._id,
            actionDescription: `Se ah creado la plantilla de proceso ${name}`
        }

        TimeLine.create(event)
        logger.info('[processTemplate, newProcessTemplate]', 'Success New ProcesTemplate added');
        res.json(entityCreate)
    } catch (error) {
        logger.error('[processTemplate, newProcessTemplate]', error)
        res.json(dataBase)
    }
}

/**
 * This method is to update a process template by Id
 * @param {MongoId} processTemplateId 
 * @param {json} templateData updated data of the template
 * @return {json} json String
 * @author Carlos Ramirez
 */

const updateProcessTemplate = async(req, res = response) => {
    logger.verbose('[processTemplate, updateProcessTemplate]', 'Update a processTemplate');
    const { processTemplateId } = req.params;
    const templateData = req.body;

    try {
        const processTemplateUpdated = await ProcessTemplate.findByIdAndUpdate(processTemplateId, templateData);
        console.log(templateData)
        const event = {
            date: dayjs().toDate(),
            actionType: update,
            target: processTemplate,
            actionBy: req.user._id,
            actionDescription: `Se ah actualizado la plantilla ${processTemplateUpdated.name}`
        }

        await TimeLine.create(event)
        logger.info('[processTemplate, updateProcessTemplate]', 'process Template activated successfully')
        res.status(200).json(entityUpdate)
    } catch (error) {
        logger.error('[processTemplate, updateProcessTemplate]', error);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to active a process template by Id
 * @param {MongoId} processTemplateId 
 * @return {json} json String
 * @author Carlos Ramirez
 */
const activeProcessTemplate = async(req, res = response) => {
    logger.verbose('[processTemplate, activeProcessTemplate]', 'Active a processTemplate');
    const { processTemplateId } = req.params;
    try {
        const processTemplateDesactivated = await ProcessTemplate.findByIdAndUpdate(processTemplateId, { isActive: true });
        const event = {
            date: dayjs().toDate(),
            actionType: active,
            target: processTemplate,
            actionBy: req.user._id,
            actionDescription: `Usuario ${req.user.firstName} ${req.user.lastName} ah activado el proceso: ${processTemplateDesactivated.name}`
        }
        await TimeLine.create(event)
        logger.info('[processTemplate, activeProcessTemplate]', 'process Template activated successfully')
        res.status(200).json(entityUpdate)
    } catch (error) {
        logger.error('[processTemplate, activeProcessTemplate]', error);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to delete a process template by Id
 * @param {MongoId} processTemplateId 
 * @return {json} json String
 * @author Carlos Ramirez
 */

const deleteProcessTemplate = async(req, res = response) => {
    logger.verbose('[processTemplate, deleteProcessTemplate]', 'Delete a processTemplate');
    const { processTemplateId } = req.params;
    try {
        const processTemplateDesactivated = await ProcessTemplate.findByIdAndUpdate(processTemplateId, { isActive: false });
        const event = {
            date: dayjs().toDate(),
            actionType: remove,
            target: processTemplate,
            actionBy: req.user._id,
            actionDescription: `Usuario ${req.user.firstName} ${req.user.lastName} ah eliminado el proceso: ${processTemplateDesactivated.name}`
        }
        await TimeLine.create(event)
        logger.info('[processTemplate, deleteProcessTemplate]', 'process Template removed successfully')
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[processTemplate, deleteProcessTemplate]', error);
        res.status(500).json(dataBase);
    }
}

module.exports = {
    newProcessTemplate,
    listProcessTemplate,
    getProcessTemplateById,
    deleteProcessTemplate,
    activeProcessTemplate,
    updateProcessTemplate
}