const { response, request } = require('express');
const dayjs = require('dayjs')
const { Customer, TimeLine, User } = require('../models');
const { logger } = require('../libs/logger');
const ObjectId = require('mongoose').Types.ObjectId;
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate } = require('config').get('message');

/**
 * This method is for get a list of Customers
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const customersGet = async(req = request, res = response) => {
    logger.verbose('[Customers, customersGet]', 'Get Customers List');
    const { page = 1, limit = 10, filter, type } = req.query;
    const query = [];
    var since = (limit * page) - limit
    if (filter) query.push({ $or: [{ firstName: { $regex: `${filter}`, $options: 'i' } }, { lastName: { $regex: `${filter}`, $options: 'i' } }] })
    if (type === 'Buyer' || type === 'Seller') query.push({ type: type })
    logger.debug("[customer try] ", req.user.role)

    if (parseInt(req.user.role.priority.split('p')[1]) > 5 || req.user.role.priority === 'default') {
        query.push({ idEmployee: new ObjectId(req.user._id) })
    }

    query.push({ status: true })

    const [total, customers] = await Promise.all([
        Customer.countDocuments({ $and: query }),
        Customer.find({ $and: query })
        .populate('creditsType')
        .skip(Number(since))
        .limit(Number(limit))
    ])
    logger.debug(`Total Customers: ${total}`)
    res.json({ total, customers });
};

/**
 * This method is for add a customer by admin panel
 * @param {customerData} req.body
 * @return {json} json String
 * @author Carlos Ramírez 
 */
const AddCustomer = async(req, res = response) => {
    logger.verbose('[Customers, AddCustomer]', 'Create a customer on the admin panel)')

    const { firstName, lastName, curp, email, nss, phone, type, creditsType, creditsAmount, address } = req.body;
    const customer = new Customer({ firstName, lastName, curp, email, nss, phone, type, creditsType, creditsAmount, idEmployee: [req.user._id], address });

    logger.debug(customer);

    try {
        const save = await customer.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'Customer',
            actionBy: req.user._id,
            actionDescription: `Cliente ${save.firstName} ${save.lastName} Creado`
        }
        TimeLine.create(event)
        logger.info('[Customers, AddCustomer] Add Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[Customers, AddCustomer]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is for add a customer by admin panel
 * @param {customerData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const AddCustomerAdmin = async(req, res = response) => {
    logger.verbose('[Customers, AddCustomerAdmin]', 'Create a customer on the admin panel)')

    const { firstName, lastName, curp, email, nss, phone, type, creditsType, creditsAmount, idEmployee, address } = req.body;
    const customer = new Customer({ firstName, lastName, curp, email, nss, phone, type, creditsType, creditsAmount, idEmployee, address });

    logger.debug(customer);

    try {
        const save = await customer.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'Customer',
            actionBy: req.user._id,
            actionDescription: `Cliente ${save.firstName} ${save.lastName} Creado`
        }
        TimeLine.create(event)
        logger.info('[Customers, AddCustomerAdmin] Add by Admin Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[Customers, AddCustomerAdmin]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is to update a customer by id
 * @param {MongoId} idCustomer
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const updateCustomerByAdmin = async(req, res = response) => {
    logger.verbose('[Customers, updateCustomerByAdmin]', 'Update customer by admin')
    const {
        id
    } = req.params;
    logger.debug(`Customer _id: ${id}`)
    const rest = req.body;
    try {
        const update = await Customer.findByIdAndUpdate(id, rest)

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Customer',
            actionBy: req.user._id,
            actionDescription: `Cliente ${update.firstName} ${update.lastName} Actualizado por Administrador`
        }
        TimeLine.create(event)
        logger.info('[Customers, updateCustomerByAdmin] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Customers,updateCustomerByAdmin]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to active a customer by id
 * @param {MongoId} idCustomer 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const customersDelete = async(req, res = response) => {
    logger.verbose('[Customers, customersDelete]', 'Delete a customer by id');
    const {
        id
    } = req.params;
    logger.debug(`Customer _id: ${id}`);
    try {
        await Customer.findByIdAndUpdate(id, {
            status: false
        });
        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'Customer',
            actionBy: req.user._id,
            actionDescription: `Cliente ${response.firstName} ${response.lastName} Eliminado`
        }
        await TimeLine.create(event)
        logger.info('[Customers, customersDelete] Successfully Removed')
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[Customers,customersDelete]', err);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to delete a customer by id
 * @param {MongoId} idCustomer 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const activeCustomer = (req, res = response) => {
    logger.verbose('[Customers, activeCustomer]', 'Active a customer by id');
    const {
        id
    } = req.params;
    logger.debug(`Customer _id: ${id}`);
    Customer.findByIdAndUpdate(id, {
            status: true
        })
        .then(customer => {
            if (!customer) return res.status(500).json(entityNoExists)
            const event = {
                date: dayjs().toDate(),
                actionType: 'ACTIVE',
                target: 'Customer',
                actionBy: req.user._id,
                actionDescription: `Cliente ${response.firstName} ${response.lastName} Restaurado`
            }
            TimeLine.create(event)
        })
        .catch(err => {
            logger.error('[Customers,activeCustomer]', err);
            res.status(500).json(dataBase);
        })
}

module.exports = {
    customersGet,
    AddCustomerAdmin,
    activeCustomer,
    customersDelete,
    AddCustomer,
    updateCustomerByAdmin
}