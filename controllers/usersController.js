const { response, request } = require('express');
const ObjectId = require('mongoose').Types.ObjectId
const dayjs = require('dayjs')
const { User, Role, TimeLine, Attachment } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path')
const { logger } = require('../libs/logger');
const { dataBase, entityNoExists, entityDelete, entityCreate, entityUpdate, paramsError } = require('config').get('message');
const DEFAULT_ROLE = 'DEFAULT_ROLE'

/**
 * This method is for get a list of Users   
 * @param {number} page
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramirez
 */

const usersGet = async(req = request, res = response) => {
    logger.verbose('[Users, usersGet]', 'Get Users List');
    let page = req.query.page || 1;
    const { limit = 10, search = "", role = "" } = req.query;
    let query = []
    page = page - 1;
    const since = page * 10;
    if (search) query.push({ $or: [{ firstName: { $regex: `${search }`, $options: 'i' } }, { lastName: { $regex: `${search }`, $options: 'i' } }, { email: { $regex: `${search}`, $options: 'i' } }] })
    if (ObjectId.isValid(role)) { query.push({ role: role }) }

    query.push({ status: true })

    console.log(query);
    const [total, users] = await Promise.all([
        User.countDocuments({ $and: query }),
        User.find({ $and: query }).populate('role', '-__v')
        .skip(Number(since))
        .limit(Number(limit))
    ])
    logger.debug(`Total Users: ${total}`)
    res.json({ total, users });
};

const usersInfoGet = async(req = request, res = response) => {
    logger.verbose('[Users, usersGet]', 'Get Users List');
    let page = req.query.page || 1;
    const { limit = 10, search = "", role = "" } = req.query;
    let query = []
    page = page - 1;
    const since = page * 10;

    query.push({ status: true })

    const [total, users] = await Promise.all([
        User.countDocuments({ $and: query }),
        User.aggregate([
            { $match: { status: true } },
            { $lookup: { from: 'roles', localField: 'role', foreignField: '_id', as: 'role' } },
            { $project: { firstName: 1, lastName: 1, role: 1 } }
        ])
    ])

    logger.debug(`Total Users: ${total}`)
    res.json({ total, users });
};
/**
 * This method is for get a list of Users
 * @param {number} page
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramirez
 */

const getUSerById = async(req = request, res = response) => {
    logger.verbose('[Users, getUSerById]', 'Get user by Id');
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).populate('role', '-__v').populate('attachments', '-__v').populate({ path: 'attachments', populate: { path: 'createdBy', model: 'User' } });
        logger.info('[Users, getUserById]', 'Success');
        res.json(user);
    } catch (error) {
        logger.error('[Users, getUserById]', error)
        res.json(dataBase);
    }
};

/**
 * This method is for add a user by admin panel
 * @param {userData} req.body
 * @return {json} json String
 * @author Carlos Ramirez 
 */
const adminUserAdd = async(req, res = response) => {
    logger.verbose('[Users, adminUserAdd]', 'Create a user on the admin panel)')

    req.body.birthDate = dayjs(req.body.birthDate, 'DD/MM/YYYY').toDate()
    const { firstName, lastName, birthDate, email, password, role, entryDate, nss, rfc, address, personalEmail, salary, baseCommission } = req.body;

    const user = new User({ firstName, lastName, birthDate, email, password, role, entryDate, nss, rfc, address, personalEmail, salary, baseCommission });

    const salt = await bcrypt.genSaltSync();
    user.password = await bcrypt.hashSync(password, salt);

    logger.info(user);
    user.save()
        .then((response) => {
            logger.debug(response);
            const event = {
                date: dayjs().toDate(),
                actionType: 'CREATE',
                target: 'User',
                actionBy: req.user._id,
                actionDescription: `Usuario ${response.firstName} ${response.lastName} Creado`
            }
            TimeLine.create(event);
            return res.json(entityCreate);
        })
        .catch(err => {
            logger.error('[Users, adminUserAdd]', err)
            res.status(501).json(dataBase)
        })
}

/**
 * This method is to get a user by id
 * @param {MongoId} idUser 
 * @return {json} json String
 * @author Carlos Ramirez
 */
const userRegister = async(req, res = response) => {
    logger.verbose('[Users, userRegister]', 'Create a user)')
    const { firstName, lastName, birthDate, email, password, entryDate, nss, rfc, address, personalEmail, salary, baseCommission } = req.body;
    const role = await Role.findOne({ role: DEFAULT_ROLE })

    const user = new User({ firstName, lastName, birthDate, email, password, entryDate, nss, rfc, address, personalEmail, salary, baseCommission, role: role._id });
    const salt = await bcrypt.genSaltSync();
    user.password = await bcrypt.hashSync(password, salt);

    user.save()
        .then((response) => {
            logger.debug(response);
            const event = {
                date: dayjs().toDate(),
                actionType: 'CREATE',
                target: 'User',
                actionBy: response._id,
                actionDescription: `Usuario ${response.firstName} ${response.lastName} Registrado`
            }
            TimeLine.create(event)
            res.json(entityCreate)
        })
        .catch(err => {
            logger.error('[Users,userRegister]', err)
            res.status(501).json(dataBase)
        })
}

/**
 * This method is to update a user by self
 * @param {MongoId} idUser 
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramirez
 */
const updateUser = async(req, res = response) => {
    logger.verbose('[Users, updateUser]', 'Update user by id')
    const _id = req.user._id;
    const { password, google, ...rest } = req.body;
    //VALIDAR
    if (password) {
        const salt = bcrypt.genSaltSync();
        rest.password = bcrypt.hashSync(password, salt);
    }
    User.findByIdAndUpdate(_id, rest)
        .then((response) => {
            logger.info(response, 'fasfdsafdsafasd')
            const event = {
                date: dayjs().toDate(),
                actionType: 'UPDATE',
                target: 'User',
                actionBy: req.user._id,
                actionDescription: `Usuario ${response.firstName} ${response.lastName} Actualizado`
            }
            TimeLine.create(event)
            res.json(entityUpdate)
        })
        .catch(err => {
            logger.error('[Users,Update]', err)
            res.status(500).json(dataBase)
        })
}

/**
 * This method is to update a user by self
 * @param {MongoId} idUser 
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramirez
 */
const updateUserPassword = (req, res = response) => {
    logger.verbose('[Users, updateUserPassword]', 'Update user password')
    const _id = req.user._id;
    const { password, newPassword } = req.body;
    if (!password && !newPassword) return res.status(500).json(paramsError)
    User.findById(_id)
        .then(user => {
            if (bcrypt.compareSync(password, user.password)) {
                const salt = bcrypt.genSaltSync();
                user.password = bcrypt.hashSync(newPassword, salt);
                user.save()
                    .then((response) => {
                        res.json(entityUpdate)
                    })
                    .catch(err => {
                        logger.error('[Users,updateUserPassword]', err)
                        res.status(500).json(dataBase)
                    })
            } else {
                return res.status(400).json(paramsError)
            }
        })
        .catch(err => {
            logger.error('[Users,updateUserPassword]', err)
            res.status(500).json(dataBase)
        })
}

/**
 * This method is to update a user by id
 * @param {MongoId} req.user._id
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramirez
 */

const updateUserByAdmin = async(req, res = response) => {
    logger.verbose('[Users, updateUserByAdmin]', 'Update user by admin')
    const { id } = req.params;
    logger.info(`User _id: ${id}`)
    const { password, google, ...rest } = req.body;
    //VALIDAR
    if (password) {
        const salt = bcrypt.genSaltSync();
        rest.password = bcrypt.hashSync(password, salt);
    }

    User.findByIdAndUpdate(id, rest)
        .then(response => {
            const event = {
                date: dayjs().toDate(),
                actionType: 'UPDATE',
                target: 'User',
                actionBy: req.user._id,
                actionDescription: `Usuario ${response.firstName} ${response.lastName} Actualizado por Administrador`
            }
            TimeLine.create(event)
            res.json(entityUpdate)
        })
        .catch(err => {
            logger.error('[Users,updateUserByAdmin]', err)
            res.status(500).json(dataBase)
        })
}

/**
 * This method is to active a user by id
 * @param {MongoId} idUser 
 * @return {json} json String
 * @author Carlos Ramirez
 */
const usersDelete = async(req, res = response) => {
    logger.verbose('[Users, usersDelete]', 'Delete a user by id');
    const { id } = req.params;
    logger.info(`User _id: ${id}`);
    try {
        await User.findByIdAndUpdate(id, { status: false });
        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'User',
            actionBy: req.user._id,
            actionDescription: `Usuario ${response.firstName} ${response.lastName} Eliminado`
        }
        await TimeLine.create(event)
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[Users,usersDelete]', error);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to delete a user by id
 * @param {MongoId} idUser 
 * @return {json} json String
 * @author Carlos Ramirez
 */
const activeUser = (req, res = response) => {
    logger.verbose('[Users, activeUser]', 'Active a user by id');
    const { id } = req.params;
    logger.info(`User _id: ${id}`);
    User.findByIdAndUpdate(id, { status: true })
        .then(user => {
            if (!user) return res.status(500).json(entityNoExists)
            const event = {
                date: dayjs().toDate(),
                actionType: 'ACTIVE',
                target: 'User',
                actionBy: req.user._id,
                actionDescription: `Usuario ${response.firstName} ${response.lastName} activado`
            }
            TimeLine.create(event)
        })
        .catch(err => {
            logger.error('[Users,activeUser]', err);
            res.status(500).json(dataBase);
        })
}

const userAuthGet = async(req, res = response) => {
    logger.verbose('[Users, userAuthGet]', 'get auth user');
    try {
        const user = await User.findById(req.user._id).populate('role', '-__v');
        const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            image: user.image
        }
        res.json({ userData, status: true })
    } catch (error) {
        logger.error('[Users, userAuthGet]', error);
        res.status(500).json(dataBase);
    }
}

const updateUserImage = async(req = request, res = response) => {
    logger.verbose('[user, updateUserImage]', 'Add new image to a user');
    try {
        const file = req.file;
        const { userId } = req.params;

        const attachmentData = {
            name: 'User Image',
            category: 'User Image',
            fileType: file.filename.split('.')[1],
            file: file.path,
            createdBy: req.user._id
        }
        const attachment = await new Attachment(attachmentData)
        await attachment.save();

        const user = await User.findById(userId)
        user.image = attachment._id;
        await user.save();

        logger.info('[user, updateUserImage]', 'Successfully')
        res.json(entityCreate);
    } catch (error) {
        logger.error('[user, updateUserImage]', error)
        res.json(dataBase)
    }
};

const getUserImage = async(req = request, res = response) => {
    logger.verbose('[Users, getUserImage], Method tu get an user Image');
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        const image = await Attachment.findById(user.image)
        const filePath = `${image.file}`;

        fs.access(filePath, error => {
            if (error) res.status(404).json(paramsError)
            else {
                res.sendFile(path.resolve(filePath));
            }
        })
    } catch (error) {
        logger.error(error)
        res.status(501).json(null);
    }
}

module.exports = {
    usersGet,
    updateUser,
    updateUserByAdmin,
    updateUserPassword,
    userRegister,
    usersDelete,
    activeUser,
    adminUserAdd,
    updateUserPassword,
    userAuthGet,
    getUSerById,
    updateUserImage,
    getUserImage,
    usersInfoGet
}