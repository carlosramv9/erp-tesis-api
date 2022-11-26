const { response, request } = require('express');
const dayjs = require('dayjs')
const { TimeLine, ProcessTemplate, Process, Customer, Step, Attachment, Task, Appointment, Contract } = require('../models');
const { logger } = require('../libs/logger');
const contract = require('../models/contract');
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

const listProcess = async (req, res = response) => {
    logger.verbose('[process, listProcess]', 'List processes');
    let { page = 1, limit = 10 } = req.query;
    var since = (limit * page) - limit

    const [total, processes] = await Promise.all([
        Process.countDocuments(),
        Process.find({})
            .select('-steps')
            .populate('processTemplate')
            .populate('customer')
            .populate('property')
            .populate('createdBy')
            .skip(Number(since))
            .limit(Number(limit))
    ])
    logger.debug(`Total Process Templates: ${total}`);

    logger.info('[process, listProcess]', 'successfully');
    res.json({ total, processes, status: true });
}

/**
 * This method is for get a list of Banks
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const processGetById = async (req = request, res = response) => {
    logger.verbose('[process, processGetById]', 'Get Investors List');
    const { id } = req.params;

    let process = await Process.findById(id)
        .populate('processTemplate')
        .populate('customer')
        .populate('property')
        .populate('createdBy')
        .populate('steps')
        .populate({ path: 'steps', populate: { path: 'tasks', populate: 'data' } })

    logger.debug(`Total Process: Success`)
    res.json(process);
};

/**
 * This method is for add a a new process
 * @param {processTemplateData} req.body
 * @return {json} json String
 * @author Carlos Ramirez 
 */

const newProcess = async (req, res = response) => {
    logger.verbose('[process, newProcess]', 'Create a new process for a client');
    const { processTemplate, customer, property } = req.body;

    try {
        const [currentProcessTemplate, currentCustomer] = await Promise.all([
            ProcessTemplate.findById(processTemplate).populate('steps').populate('steps.tasks'),
            Customer.findById(customer)
        ])

        const firstStep = new Step({ index: currentProcessTemplate.steps[0].index, name: currentProcessTemplate.steps[0].name });
        firstStep.save();

        const processData = {
            processTemplate,
            customer,
            property,
            type: currentProcessTemplate.type,
            createdBy: req.user._id,
            currentStepName: currentProcessTemplate.steps[0].name,
            steps: [firstStep._id]
        }
        const newProcess = new Process(processData);
        await newProcess.save();

        const event = {
            date: dayjs().toDate(),
            actionType: create,
            target: process,
            actionBy: req.user._id,
            actionDescription: `Se ah creado un nuevo proceso para el cliente ${currentCustomer.firstName} ${currentCustomer.lastName}`
        }
        if (newProcess) TimeLine.create(event);

        logger.info('[process, newProcess]', 'Success New Proces added');
        res.json(entityCreate);
    } catch (error) {
        logger.error('[process, newProcess]', error);
        res.json(dataBase);
    }
}

/**
 * This method is for add a new task into a step
 * @param {extra data} req.body
 * @param {stepId, processTemplateId} req.params
 * @param {index} req.query
 * @return {json} json String
 * @author Carlos Ramirez 
 */

const newTask = async (req, res = response) => {
    logger.verbose('[process, newTask]', 'Add a new task into a step');
    const file = req.file;
    const { stepId, processTemplateId } = req.params;
    const { index } = req.query;
    const body = req.body;
    let task = {};
    try {
        const [currentProcessTemplate, currentStep] = await Promise.all([
            ProcessTemplate.findById(processTemplateId),
            Step.findById(stepId)
        ])

        if (!currentProcessTemplate && !currentStep) return res.json(entityNoExists);
        const taskTemplate = await currentProcessTemplate.steps[currentStep.index - 1].tasks.find(task => task.index == index);
        //logger.debug(taskTemplate);
        switch (taskTemplate.type) {
            case 'attachment':
                task = await _processAttachmentsType(file, taskTemplate, body, req.user);
                break;
            case 'contract':
                task = await _processContractType(file, taskTemplate, body, req.user);
                break;
            case 'appointment':
                task = await _processAppointmentType(taskTemplate, body, req.user);
                break;
            default:
                break;
        }
        logger.debug(task);
        currentStep.tasks.push(task._id);
        await currentStep.save();
        res.json(entityUpdate);
    } catch (error) {
        logger.error('[process, newProcess]', error);
        res.json(dataBase);
    }
}

/**
 * This method is to procees attachment task type data
 * @return {json} json String
 * @author Carlos Ramirez 
 */

const _processAttachmentsType = async (file, taskTemplate, body, user) => {
    logger.verbose('[(process, _processAttachmentsType)', 'process an Attachment');
    const { name } = body;
    return new Promise(async (resolve, reject) => {
        try {
            const attachmentData = {
                name,
                fileType: file.filename.split('.')[1],
                file: file.path,
                createdBy: user._id,
                category: 'Task'
            }
            const attachment = await new Attachment(attachmentData);
            await attachment.save();

            const taskData = {
                name: taskTemplate.name,
                index: taskTemplate.index,
                description: taskTemplate.description,
                note: body.note,
                type: taskTemplate.type,
                data: attachment._id
            }
            const task = await new Task(taskData);
            await task.save();
            return resolve(task)
        } catch (error) {
            logger.error('(process, _processAttachmentsType)', error);
            return reject(error);
        }

    })
}

/**
 * This method is to procees contract task type data
 * @return {json} json String
 * @author Carlos Ramirez 
 */

const _processContractType = async (file, taskTemplate, body, user) => {
    logger.verbose('[(process, _processContractType)', 'process an Attachment');
    const { customer, type, name, note } = body;
    return new Promise(async (resolve, reject) => {
        try {

            const attachmentData = {
                name,
                fileType: file.filename.split('.')[1],
                file: file.path,
                createdBy: user._id,
                category: 'Task'
            }
            const attachment = await new Attachment(attachmentData);
            await attachment.save();

            const contractData = {
                customer,
                user: user._id,
                type,
                createdBy: user._id,
                file: attachment._id
            }
            const contract = await new Contract(contractData);
            await contract.save();

            const taskData = {
                name: taskTemplate.name,
                index: taskTemplate.index,
                description: taskTemplate.description,
                note: body.note,
                type: taskTemplate.type,
                data: attachment._id
            }

            const task = await new Task(taskData);
            await task.save();
            return resolve(task)
        } catch (error) {
            logger.error('(process, _processContractType)', error);
            return reject(error);
        }

    })
}

/**
 * This method is to procees appointment task type data
 * @return {json} json String
 * @author Carlos Ramirez 
 */

const _processAppointmentType = async (taskTemplate, body, user) => {
    logger.verbose('[(process, _processAppointmentType)', 'process an Attachment');
    const { place, date, customer, participants = [] } = body;
    logger.debug(participants)
    return new Promise(async (resolve, reject) => {
        try {
            participants.push(user._id);
            const appointmentData = {
                place,
                date: dayjs(date, 'DD/MM/YYYY HH').toDate(),
                customer,
                participants: participants,
                createdBy: user._id
            }
            const appointment = new Appointment(appointmentData);
            await appointment.save();

            const taskData = {
                name: taskTemplate.name,
                index: taskTemplate.index,
                description: taskTemplate.description,
                note: body.note,
                type: taskTemplate.type,
                data: appointment._id
            }
            const task = await new Task(taskData);
            await task.save();
            return resolve(task)
        } catch (error) {
            logger.error('(process, _processAppointmentType)', error);
            return reject(error);
        }

    })
}


module.exports = {
    listProcess,
    newProcess,
    newTask,
    processGetById
}