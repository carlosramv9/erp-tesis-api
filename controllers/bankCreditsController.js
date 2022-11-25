const { response, request } = require('express');
const dayjs = require('dayjs')
const { BankCredit, TimeLine } = require('../models');
const { logger } = require('../libs/logger');
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate } = require('config').get('message');

/**
 * This method is for get a list of BankCredits
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const bankCreditsGet = async(req = request, res = response) => {
    logger.verbose('[BankCredits, bankCreditsGet]', 'Get BankCredits List');
    const { page = 1, limit = 10 } = req.query;
    const query = {
        status: true
    };

    var since = (limit * page) - limit

    const [total, bankCredits] = await Promise.all([
        BankCredit.countDocuments(query),
        BankCredit.find(query)
        .skip(Number(since))
        .limit(Number(limit))
    ])
    logger.debug(`Total BankCredits: ${total}`)
    res.json({
        total,
        bankCredits
    });
};

/**
 * This method is for add a bankCredit by admin panel
 * @param {bankCreditData} req.body
 * @return {json} json String
 * @author Carlos Ramírez 
 */
const AddBankCredit = async(req, res = response) => {
    logger.verbose('[BankCredits, AddBankCredit]', 'Create a bankCredit on the admin panel)')

    const { name, email, phone, contacts } = req.body;
    const bankCredit = new BankCredit({
        name,
        createdBy: req.user._id
    });

    logger.debug(bankCredit);

    try {
        const save = await bankCredit.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'BankCredit',
            actionBy: req.user._id,
            actionDescription: `Crédito de Banco '${save.name}' Creado`
        }
        TimeLine.create(event)
        logger.info('[BankCredits, AddBankCredit] Add Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[BankCredits, AddBankCredit]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is for add a bankCredit by admin panel
 * @param {bankCreditData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const AddBankCreditAdmin = async(req, res = response) => {
    logger.verbose('[BankCredits, AddBankCreditAdmin]', 'Create a bank credit on the admin panel)')

    const {
        name,
    } = req.body;
    const bankCredit = new BankCredit({
        name,
        email,
        phone,
        contacts
    });

    logger.debug(bankCredit);

    try {
        const save = await bankCredit.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'BankCredit',
            actionBy: req.user._id,
            actionDescription: `Crédito de Banco '${save.name}' Creado por Administrador`
        }
        TimeLine.create(event)
        logger.info('[BankCredits, AddBankCreditAdmin] Add by Admin Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[BankCredits, AddBankCreditAdmin]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is to update a bankCredit by id
 * @param {MongoId} idBankCredit
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const updateBankCreditByAdmin = async(req, res = response) => {
    logger.verbose('[BankCredits, updateBankCreditByAdmin]', 'Update bankCredit by admin')
    const { id } = req.params;
    logger.debug(`BankCredit _id: ${id}`)
    const rest = req.body;
    try {
        const update = await BankCredit.findByIdAndUpdate(id, rest)

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'BankCredit',
            actionBy: req.user._id,
            actionDescription: `Crédito de Banco '${update.name}' actualizado por Administrador`
        }
        TimeLine.create(event)
        logger.info('[BankCredits, updateBankCreditByAdmin] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[BankCredits,updateBankCreditByAdmin]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to active a bankCredit by id
 * @param {MongoId} idBankCredit 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const bankCreditsDelete = async(req, res = response) => {
    logger.verbose('[BankCredits, bankCreditsDelete]', 'Delete a bankCredit by id');
    const { id } = req.params;
    logger.debug(`BankCredit _id: ${id}`);
    try {
        await BankCredit.findByIdAndUpdate(id, {
            status: false
        });
        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'BankCredit',
            actionBy: req.user._id,
            actionDescription: `Crédito de Banco '${response.name}' Eliminado`
        }
        await TimeLine.create(event)
        logger.info('[BankCredits, bankCreditsDelete] Successfully Removed')
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[BankCredits,bankCreditsDelete]', err);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to delete a bankCredit by id
 * @param {MongoId} idBankCredit 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const activeBankCredit = (req, res = response) => {
    logger.verbose('[BankCredits, activeBankCredit]', 'Active a bankCredit by id');
    const { id } = req.params;
    logger.debug(`BankCredit _id: ${id}`);
    BankCredit.findByIdAndUpdate(id, {
            status: true
        })
        .then(bankCredit => {
            if (!bankCredit) return res.status(500).json(entityNoExists)
            const event = {
                date: dayjs().toDate(),
                actionType: 'ACTIVE',
                target: 'BankCredit',
                actionBy: req.user._id,
                actionDescription: `Crédito de Banco ${response.name} Restaurado`
            }
            TimeLine.create(event)
        })
        .catch(err => {
            logger.error('[BankCredits,activeBankCredit]', err);
            res.status(500).json(dataBase);
        })
}

module.exports = {
    bankCreditsGet,
    AddBankCreditAdmin,
    activeBankCredit,
    bankCreditsDelete,
    AddBankCredit,
    updateBankCreditByAdmin
}