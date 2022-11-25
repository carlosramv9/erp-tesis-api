const { response, request } = require('express');
const dayjs = require('dayjs')
const { Category, TimeLine } = require('../models');
const { logger } = require('../libs/logger');
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate } = require('config').get('message');

/**
 * This method is for get a list of Categories
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const categoriesGet = async(req = request, res = response) => {
    logger.verbose('[Categories, categoriesGet]', 'Get Categories List');
    const { page = 1, limit = 10 } = req.query;
    const query = {
        status: true
    };

    var since = (limit * page) - limit

    const [total, categories] = await Promise.all([
        Category.countDocuments(query),
        Category.find(query)
        .skip(Number(since))
        .limit(Number(limit))
    ])
    logger.debug(`Total Categories: ${total}`)
    res.json({
        total,
        categories
    });
};

/**
 * This method is for add a category by admin panel
 * @param {categoryData} req.body
 * @return {json} json String
 * @author Carlos Ramírez 
 */
const AddCategory = async(req, res = response) => {
    logger.verbose('[Categories, AddCategory]', 'Create a category on the admin panel)')

    const { name } = req.body;
    const category = new Category({ name });

    logger.debug(category);

    try {
        const save = await category.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'Category',
            actionBy: req.user._id,
            actionDescription: `Modelo de Construcción ${save.firstName} Creado`
        }
        TimeLine.create(event)
        logger.info('[Categories, AddCategory] Add Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[Categories, AddCategory]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is for add a category by admin panel
 * @param {categoryData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const AddCategoryAdmin = async(req, res = response) => {
    logger.verbose('[Categories, AddCategoryAdmin]', 'Create a category on the admin panel)')

    const { name } = req.body;
    const category = new Category({ name });

    logger.debug(category);

    try {
        const save = await category.save()
        logger.debug(save);
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'Category',
            actionBy: req.user._id,
            actionDescription: `Modelo de Construcción ${save.firstName} Creado por Administrador`
        }
        TimeLine.create(event)
        logger.info('[Categories, AddCategoryAdmin] Add by Admin Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[Categories, AddCategoryAdmin]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is to update a category by id
 * @param {MongoId} idCategory
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const updateCategoryByAdmin = async(req, res = response) => {
    logger.verbose('[Categories, updateCategoryByAdmin]', 'Update category by admin')
    const {
        id
    } = req.params;
    logger.debug(`Category _id: ${id}`)
    const rest = req.body;
    try {
        const update = await Category.findByIdAndUpdate(id, rest)

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Category',
            actionBy: req.user._id,
            actionDescription: `Modelo de Construcción ${update.firstName} actualizado por administrador`
        }
        TimeLine.create(event)
        logger.info('[Categories, updateCategoryByAdmin] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Categories,updateCategoryByAdmin]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to active a category by id
 * @param {MongoId} idCategory 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const categoriesDelete = async(req, res = response) => {
    logger.verbose('[Categories, categoriesDelete]', 'Delete a category by id');
    const {
        id
    } = req.params;
    logger.debug(`Category _id: ${id}`);
    try {
        await Category.findByIdAndUpdate(id, {
            status: false
        });
        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'Category',
            actionBy: req.user._id,
            actionDescription: `Modelo de Construcción ${response.firstName} eliminado`
        }
        await TimeLine.create(event)
        logger.info('[Categories, categoriesDelete] Successfully Removed')
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[Categories,categoriesDelete]', err);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to delete a category by id
 * @param {MongoId} idCategory 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const activeCategory = (req, res = response) => {
    logger.verbose('[Categories, activeCategory]', 'Active a category by id');
    const {
        id
    } = req.params;
    logger.debug(`Category _id: ${id}`);
    Category.findByIdAndUpdate(id, {
            status: true
        })
        .then(category => {
            if (!category) return res.status(500).json(entityNoExists)
            const event = {
                date: dayjs().toDate(),
                actionType: 'ACTIVE',
                target: 'Category',
                actionBy: req.user._id,
                actionDescription: `Modelo de Construcción ${response.firstName} restaurado`
            }
            TimeLine.create(event)
        })
        .catch(err => {
            logger.error('[Categories,activeCategory]', err);
            res.status(500).json(dataBase);
        })
}

module.exports = {
    categoriesGet,
    AddCategoryAdmin,
    activeCategory,
    categoriesDelete,
    AddCategory,
    updateCategoryByAdmin
}