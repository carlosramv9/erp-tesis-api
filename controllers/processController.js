const { response, request } = require('express');
const dayjs = require('dayjs')
const { TimeLine, ProcessTemplate, Process, Customer, Step, Attachment, Task, Appointment, Contract, Comment, Property } = require('../models');
const { logger } = require('../libs/logger');
const contract = require('../models/contract');
const { Schema } = require('mongoose');
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
const listProcess = async(req, res = response) => {
    logger.verbose('[process, listProcess]', 'List processes');
    let { page = 1, limit = 10 } = req.query;
    var since = (limit * page) - limit

    const [total, processes] = await Promise.all([
        Process.countDocuments(),
        Process.find({})
        .populate('processTemplate')
        .populate('customer')
        .populate('property')
        .populate('createdBy')
        .populate('steps')
        .populate({ path: 'steps', populate: { path: 'tasks', populate: 'data attachments' } })
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
const processGetById = async(req = request, res = response) => {
    logger.verbose('[process, processGetById]', 'Get Investors List');
    const { id } = req.params;

    let process = await Process.findById(id)
        .populate('processTemplate')
        .populate('customer')
        .populate('property')
        .populate('createdBy')
        .populate('steps')
        .populate({ path: 'steps', populate: { path: 'comments', model: 'Comment', populate: { path: 'user', model: 'User' } } })
        .populate({ path: 'steps', populate: { path: 'tasks', populate: 'data attachments' } })

    logger.debug(`Total Process: Success`)
    res.json(process);
};

/**
 * This method is for add a a new process
 * @param {processTemplateData} req.body
 * @return {json} json String
 * @author Carlos Ramirez 
 */
const newProcess = async(req, res = response) => {
    logger.verbose('[process, newProcess]', 'Create a new process for a client');
    const { processTemplate, customer, property } = req.body;

    try {
        const [currentProcessTemplate, currentCustomer, currentProperty] = await Promise.all([
            ProcessTemplate.findById(processTemplate).populate('steps').populate('steps.tasks'),
            Customer.findById(customer),
            Property.findById(property)
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
            steps: [firstStep._id],
            totalSteps: currentProcessTemplate.totalSteps
        }
        const newProcess = new Process(processData);
        await newProcess.save();

        currentProperty.propertyState = 'secluded'
        currentProperty.save()

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
 * This method is for add a a new process
 * @param {stepId} req.params
 * @return {json} json String
 * @author Carlos Ramirez 
 */
const newStep = async(req, res = response) => {
    logger.verbose('[process, newStep]', 'Create a new step for a process');
    const { processId } = req.params;

    try {
        const process = await Process.findById(processId).populate('processTemplate')
            .populate('steps').populate({ path: 'steps', populate: 'tasks' })
        const template = await ProcessTemplate.findById(process.processTemplate)
        const currentStep = await Step.findById(process.steps[process.currentStep - 1]._id)


        const indexes = process.processTemplate.steps[process.currentStep - 1].tasks.filter(x => x.isRequired).map(x => x.index)
        let result = true;
        let state = 'complete';

        if (indexes.length > 0) {
            indexes.forEach(x => {
                if (!process.steps[process.currentStep - 1].tasks.some(y => y.index === x && y.status === 'complete')) {
                    result = false;
                    state = 'onHold'
                }
            })
        } else {
            process.steps[process.currentStep - 1].tasks.every(y => y.status === 'complete') || process.currentStep === process.totalSteps ?
                state = 'complete' : state = 'onHold'
        }

        currentStep.status = state
        currentStep.save()

        if (process.currentStep < process.totalSteps && !process.steps.find(x => x.index === process.currentStep + 1)) {
            const nextStep = new Step({
                index: template.steps[process.currentStep].index,
                name: template.steps[process.currentStep].name
            });
            await nextStep.save();

            process.currentStep += 1
            process.steps.push(nextStep._id)
            process.currentStepName = process.processTemplate.steps[process.currentStep - 1].name

            const event = {
                date: dayjs().toDate(),
                actionType: 'CREATE',
                target: 'Process',
                actionBy: req.user._id,
                actionDescription: `Se ah creado un nuevo paso para el proceso ${template.name}`
            }
            if (nextStep) TimeLine.create(event);
        } else if (process.currentStep === process.totalSteps) {
            const property = await Property.findById(process.property)
            property.propertyState = 'selled'
            property.save()
            process.status = 'finished'
            process.statusName = 'Finalizado'
        } else {
            process.currentStep += 1
        }
        await process.save();

        logger.info('[process, newStep]', 'Success New Step added');
        res.json(entityCreate);
    } catch (error) {
        logger.error('[process, newStep]', error);
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
const newTask = async(req, res = response) => {
    logger.verbose('[process, newTask]', 'Add a new task into a step');
    const file = req.files;
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
        const taskTemplate = await currentProcessTemplate.steps[currentStep.index - 1].tasks.find(task => task.index === Number(index));

        switch (taskTemplate.type) {
            case 'Attachment':
                task = await _processAttachmentsType(file, taskTemplate, body, req.user);
                break;
            case 'Contract':
                task = await _processContractType(file, taskTemplate, body, req.user);
                break;
            case 'Appointment':
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
        logger.error('[process, newTask]', error);
        res.json(dataBase);
    }
}

const updateTask = async(req, res = response) => {
    logger.verbose('[process, updateTask]', 'Update task into a step');
    const files = req.files;
    const { taskId } = req.params;
    const body = req.body;
    let task = {};
    logger.debug(taskId)
    try {
        const [currentTask] = await Promise.all([
            Task.findById(taskId)
        ])

        if (!currentTask) return res.json(entityNoExists);

        logger.debug(currentTask.type)
        switch (currentTask.type) {
            case 'Attachment':
                let documents = []
                files.forEach(file => {
                    const attachmentData = {
                        name: file.filename,
                        fileType: file.mimetype,
                        file: file.path,
                        createdBy: req.user._id,
                        category: currentTask.name
                    }
                    const attachment = new Attachment(attachmentData);
                    attachment.save();
                    documents.push(attachment._id)
                })
                currentTask.attachments.push(documents)
                break;
            case 'Contract':
                task = await _processContractType(file, taskTemplate, body, req.user);
                break;
            case 'Appointment':
                const appointmentData = {
                    place: body.place,
                    date: dayjs(body.date, 'DD/MM/YYYY HH').toDate(),
                    customer: body.customer,
                    participants: body.participants,
                    createdBy: req.user._id
                }
                await Appointment.findByIdAndUpdate(currentTask.data, appointmentData)
                break;
            default:
                break;
        }

        await currentTask.save();
        res.json(entityUpdate);
    } catch (error) {
        logger.error('[process, updateTask]', error);
        res.json(dataBase);
    }
}

/**
 * This method is for add a new task into a step
 * @param {extra data} req.body
 * @param {processId} req.params
 * @param {index} req.query
 * @return {json} json String
 * @author Carlos Ramirez 
 */
const changeCurrentStep = async(req, res = response) => {
    logger.verbose('[process, changeCurrentStep]', 'Add a new task into a step');
    const { processId } = req.params;
    const { index } = req.query;
    try {
        const [currentProcess] = await Promise.all([
            Process.findById(processId).populate('steps')
        ])
        const currentStep = await Step.findById(currentProcess.steps[index - 1]._id)

        currentProcess.currentStep = index
        await currentProcess.save()

        res.json(entityUpdate);
    } catch (error) {
        logger.error('[process, changeCurrentStep]', error);
        res.json(dataBase);
    }
}

/**
 * This methos is for verify appointment
 * @param {appointmentId} req.params
 * @return {json} json String
 * @author Carlos Ramirez
 */
const verifyAppointment = async(req, res = response) => {
    logger.verbose('[process, verifyAppointment]', 'Update a task into a step');
    const { appointmentId } = req.params;
    try {
        let response = await Appointment.findByIdAndUpdate(appointmentId, { attended: true }).populate('customer')
        logger.debug(response)
        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Task',
            actionBy: req.user._id,
            actionDescription: `La cita con ${response.customer.firstName} se verifico`
        }
        await TimeLine.create(event)

        res.json(entityUpdate);
    } catch (error) {
        logger.error('[process, verifyAppointment]', error);
        res.json(dataBase);
    }
}

/**
 * This methos is for verify appointment
 * @param {taskId} req.params
 * @return {json} json String
 * @author Carlos Ramirez
 */
const finishTask = async(req, res = response) => {
    logger.verbose('[process, finishTask]', 'Update a task into a step');
    const { taskId } = req.params;
    try {
        let response = await Task.findByIdAndUpdate(taskId, { status: 'complete' })

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Task',
            actionBy: req.user._id,
            actionDescription: `La tarea ${response.name} se finalizó`
        }
        await TimeLine.create(event)

        res.json(entityUpdate);
    } catch (error) {
        logger.error('[process, finishTask]', error);
        res.json(dataBase);
    }
}

/**
 * This methos is for verify appointment
 * @param {taskId} req.params
 * @return {json} json String
 * @author Carlos Ramirez
 */
const activeProcess = async(req, res = response) => {
    logger.verbose('[process, activeProcess]', 'Update a task into a step');
    const { processId } = req.params;
    try {
        let process = await Process.findByIdAndUpdate(processId, { status: 'inProgress', statusName: 'En Progreso' })

        const property = await Property.findById(process.property)
        property.propertyState = 'secluded'
        property.save()

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Task',
            actionBy: req.user._id,
            actionDescription: `La tarea ${process.name} se reactivo`
        }
        await TimeLine.create(event)

        res.json(entityUpdate);
    } catch (error) {
        logger.error('[process, activeProcess]', error);
        res.json(dataBase);
    }
}


/**
 * This methos is for verify appointment
 * @param {taskId} req.params
 * @return {json} json String
 * @author Carlos Ramirez
 */
const cancelProcess = async(req, res = response) => {
    logger.verbose('[process, activeProcess]', 'Update a task into a step');
    const { processId } = req.params;
    try {
        let process = await Process.findByIdAndUpdate(processId, { status: 'canceled', statusName: 'Cancelado' })

        const property = await Property.findById(process.property)
        property.propertyState = 'available'
        property.save()

        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'Task',
            actionBy: req.user._id,
            actionDescription: `La tarea ${process.name} se cancelo`
        }
        await TimeLine.create(event)

        res.json(entityUpdate);
    } catch (error) {
        logger.error('[process, activeProcess]', error);
        res.json(dataBase);
    }
}

/**
 * This methos is for verify appointment
 * @param {taskId} req.params
 * @return {json} json String
 * @author Carlos Ramirez
 */
const addCommentStep = async(req, res = response) => {
    logger.verbose('[process, addCommentStep]', 'Add a comment into a step');
    const { stepId } = req.params;
    const { comment } = req.body
    try {
        let step = await Step.findById(stepId)

        let newComment = new Comment({
            comment,
            user: req.user._id
        })
        await newComment.save()

        step.comments.push(newComment)
        step.save()

        res.json(entityCreate);
    } catch (error) {
        logger.error('[process, addCommentStep]', error);
        res.json(dataBase);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This method is to procees attachment task type data
 * @return {json} json String
 * @author Carlos Ramirez 
 */
const _processAttachmentsType = async(files, taskTemplate, body, user) => {
    logger.verbose('[(process, _processAttachmentsType)]', 'process an Attachment');
    const { name } = body;
    return new Promise(async(resolve, reject) => {
        try {
            let documents = []
            files.forEach(file => {
                const attachmentData = {
                    name: file.filename,
                    fileType: file.mimetype,
                    file: file.path,
                    createdBy: user._id,
                    category: taskTemplate.name
                }
                const attachment = new Attachment(attachmentData);
                attachment.save();
                documents.push(attachment._id)
            })

            const taskData = {
                name: taskTemplate.name,
                index: taskTemplate.index,
                description: taskTemplate.description,
                note: body.note,
                type: taskTemplate.type,
                attachments: documents
            }
            const task = new Task(taskData);
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
const _processContractType = async(files, taskTemplate, body, user) => {
    logger.verbose('[(process, _processContractType)', 'process an Attachment');
    const { customer, type, name, note } = body;
    return new Promise(async(resolve, reject) => {
        try {

            let document;
            files.forEach(file => {
                const attachmentData = {
                    name: file.filename,
                    fileType: file.mimetype,
                    file: file.path,
                    createdBy: user._id,
                    category: taskTemplate.name
                }
                const attachment = new Attachment(attachmentData);
                attachment.save();
                document = attachment._id
            })
            logger.debug(document)

            const contractData = {
                customer,
                user: user._id,
                type,
                createdBy: user._id,
                file: document
            }
            const contract = await new Contract(contractData);
            await contract.save();

            const taskData = {
                name: taskTemplate.name,
                index: taskTemplate.index,
                description: taskTemplate.description,
                note: body.note,
                type: taskTemplate.type,
                data: contract._id
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
const _processAppointmentType = async(taskTemplate, body, user) => {
    logger.verbose('[(process, _processAppointmentType)', 'process an Attachment');
    const { place, date, customer, participants = [] } = body;
    logger.debug(participants)
    return new Promise(async(resolve, reject) => {
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
    processGetById,
    verifyAppointment,
    finishTask,
    updateTask,
    newStep,
    changeCurrentStep,
    addCommentStep,
    activeProcess,
    cancelProcess
}