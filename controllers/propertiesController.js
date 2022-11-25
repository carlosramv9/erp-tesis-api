const {
    response,
    request
} = require('express');
var mongoose = require('mongoose');
const dayjs = require('dayjs')
const { Property, TimeLine, Attachment } = require('../models');
const {
    logger
} = require('../libs/logger');
const {
    dataBase,
    entityNoExists,
    entityDelete,
    entityCreate,
    entityUpdate
} = require('config').get('message');
const fs = require('fs');
const path = require('path')

/**
 * This method is for get a list of Properties
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const propertiesGet = async(req = request, res = response) => {
    logger.verbose('[Properties, propertiesGet]', 'Get Properties List');

    const {
        page = 1, limit = 100, type = 'ALL'
    } = req.query;
    var query = [{ status: true }];
    var fields = ['builder', 'subdivision', 'model']

    logger.debug(type)

    // if (type !== 'ALL') query.push({
    //     type,
    //     status: true
    // })

    // if (filter) {
    //     var status = false
    //     for (let index = 0; index < fields.length; index++) {
    //         switch (fields[index]) {
    //             case 'builder':

    //                 break;
    //             case 'subdivision':
    //                 break;
    //             case 'model':
    //                 break;

    //             default:
    //                 break;
    //         }
    //         var field = {
    //             [fields[index].name]: {
    //                 $regex: filter,
    //                 $options: 'i'
    //             },
    //             status: true
    //         }

    //         query.push(field)
    //     }
    // }

    var since = (limit * page) - limit

    const [total, properties] = await Promise.all([
        Property.countDocuments(query),
        Property.find({ $or: query })
        .populate('image')
        .populate('subdivision')
        .populate('builder')
        .populate('model')
        .skip(Number(since))
        .limit(Number(limit))
        .sort({
            builder: 'asc'
        })
    ])
    logger.debug(`Total Properties: ${total}`)
    res.json({
        total,
        properties
    });
};

/**
 * This method is for get a list of Properties
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const propertyGet = async(req = request, res = response) => {
    logger.verbose('[Properties, propertyGet]', 'Get Properties List');
    const {
        page = 1, limit = 10
    } = req.query;
    const query = {
        status: true
    };

    const id = req.params.id
    logger.debug(id)
    var since = (limit * page) - limit

    try {
        const property = await Property.findById(id)
            .populate('attachments')
            .populate({
                path: 'attachments',
                populate: 'file'
            })
            .populate('image')
            .populate('subdivision')
            .populate('builder')
            .populate('model')

        logger.info('[Properties, propertyGet]', 'Success');
        res.json(
            property
        );
    } catch (error) {
        logger.error('[Properties, propertyGet]', error)
        res.json(dataBase);
    }
};

/**
 * This method is for add a property by admin panel
 * @param {propertyData} req.body
 * @return {json} json String
 * @author Carlos Ramírez 
 */
const AddProperty = async(req, res = response) => {
    logger.verbose('[Properties, AddProperty]', 'Create a property on the admin panel)')

    logger.info(JSON.stringify(req.body))

    const {
        builder,
        subdivision,
        model,
        floors,
        bedrooms,
        bathrooms,
        halfbathrooms,
        constructionmts,
        mtsland,
        equipment,
        creditsAmount,
        price,
        appraisal,
        discount,
        deliveryTime,
        credits,
        assessment,
        debts,
        catcher,
        owners,
        type,
        businessType,
        description,
        exchangeRate,
        street,
        suburb,
        number,
        customers,
        taxation,
        zipcode,
        repairs,
        services,
        soldBy,
        title,
        commission,
        commissionType,
        //image
    } = req.body;

    logger.debug(customers)

    const property = new Property({
        builder,
        subdivision,
        model,
        floors,
        bedrooms,
        bathrooms,
        halfbathrooms,
        constructionmts,
        mtsland,
        equipment,
        creditsAmount,
        price,
        appraisal,
        discount,
        deliveryTime,
        credits,
        assessment,
        debts,
        catcher,
        owners,
        type,
        businessType,
        description,
        exchangeRate,
        street,
        suburb,
        number,
        customers,
        taxation,
        zipcode,
        repairs,
        services,
        soldBy,
        title,
        commission,
        commissionType,
        idEmployee: [req.user._id]
            //image
    });

    try {
        const save = await property.save()
        const event = {
            date: dayjs().toDate(),
            actionType: 'CREATE',
            target: 'Property',
            actionBy: req.user._id,
            actionDescription: `Propiedad de ${save.builder} Creado`
        }
        TimeLine.create(event)
        logger.info('[Properties, AddProperty] Add Success')
        return res.json(entityCreate)
    } catch (err) {
        logger.error('[Properties, AddProperty]', err)
        res.status(501).json(dataBase)
    }
}

/**
 * This method is to update a property by id
 * @param {MongoId} idProperty
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const updatePropertyByAdmin = async(req, res = response) => {
    logger.verbose('[Properties, updatePropertyByAdmin]', 'Update property by admin')
    const {
        id
    } = req.params;
    logger.debug(`Property _id: ${id}`)
    const rest = req.body;

    try {
        const prop = await Property.findById(id)
        const update = await Property.findByIdAndUpdate(id, rest)

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Property',
            actionBy: req.user._id,
            actionDescription: `Propiedad de ${update.builder}, ${update.subdivision} updated by admin`
        }
        TimeLine.create(event)
        logger.info('[Properties, updatePropertyByAdmin] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Properties,updatePropertyByAdmin]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to update a property by id
 * @param {MongoId} idProperty
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const publishProperty = async(req, res = response) => {
    logger.verbose('[Properties, publishProperty]', 'Update property by admin')
    const {
        id
    } = req.params;
    logger.debug(`Property _id: ${id}`)
    const rest = req.body;
    try {
        const prop = await Property.findById(id)

        prop.isPublished = !prop.isPublished

        const update = await Property.findByIdAndUpdate(id, prop)
            .populate('builder')
            .populate('subdivision')

        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Property',
            actionBy: req.user._id,
            actionDescription: `Propiedad de ${update.builder.name}, ${update.subdivision.name} ${prop.isPublished ? 'publicada' : 'despublicada'}`
        }
        TimeLine.create(event)
        logger.info('[Properties, publishProperty] Update Success')

        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Properties,publishProperty]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to active a property by id
 * @param {MongoId} idProperty 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const propertiesDelete = async(req, res = response) => {
    logger.verbose('[Properties, propertiesDelete]', 'Delete a property by id');
    const {
        id
    } = req.params;
    logger.debug(`Property _id: ${id}`);
    try {
        await Property.findByIdAndUpdate(id, {
            status: false
        });
        const event = {
            date: dayjs().toDate(),
            actionType: 'DELETE',
            target: 'Property',
            actionBy: req.user._id,
            actionDescription: `Propiedad de ${response.builder}, ${response.model} Eliminado`
        }
        await TimeLine.create(event)
        logger.info('[Properties, propertiesDelete] Successfully Removed')
        res.status(200).json(entityDelete)
    } catch (error) {
        logger.error('[Properties,propertiesDelete]', err);
        res.status(500).json(dataBase);
    }
}

/**
 * This method is to delete a property by id
 * @param {MongoId} idProperty 
 * @return {json} json String
 * @author Carlos Ramírez
 */
const activeProperty = (req, res = response) => {
    logger.verbose('[Properties, activeProperty]', 'Active a property by id');
    const {
        id
    } = req.params;
    logger.debug(`Property _id: ${id}`);
    Property.findByIdAndUpdate(id, {
            status: true
        })
        .then(property => {
            if (!property) return res.status(500).json(entityNoExists)
            const event = {
                date: dayjs().toDate(),
                actionType: 'ACTIVE',
                target: 'Property',
                actionBy: req.user._id,
                actionDescription: `Propiedad de ${response.firstName} ${response.lastName} Restaurado`
            }
            TimeLine.create(event)
        })
        .catch(err => {
            logger.error('[Properties,activeProperty]', err);
            res.status(500).json(dataBase);
        })
}

///////////////  DOCUMENTS /////////////////////////////////////

/**
 * This method is to update a property by id
 * @param {MongoId} idProperty
 * @param {updateData} req.body
 * @return {blob} json String
 * @author Carlos Ramírez
 */
const getCoverImageProperty = async(req = request, res = response) => {
    logger.verbose('[Properties, getCoverImageProperty], Method tu get an Cover Image');
    const id = req.params.id;
    try {
        const property = await Property.findById(id);
        const image = await Attachment.findById(property.image)
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

/**
 * This method is to update a property by id
 * @param {MongoId} idProperty
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const updateDocument = async(req, res = response) => {
    logger.verbose('[Properties, updateDocument]', 'Update Document by admin')
    const {
        id
    } = req.params;
    logger.debug(`Property _id: ${id}`)
    const {
        category
    } = req.body;
    const file = req.file

    try {
        const filetype = /application\/pdf/;
        const extname = filetype.test(file.mimetype)
        const fileData = {
            name: file.filename,
            fileType: file.mimetype,
            category: category,
            file: file.path,
            createdBy: req.user._id
        }


        var attach = new Attachment(fileData)
        attach.save(fileData);

        var propAttach = {
            default: 0,
            isPublic: false,
            file: attach._id,
            actionBy: req.user._id
        }

        const update = await Property.findById(id)
        const attachments = update.attachments

        attachments.push(propAttach)

        await update.save()
        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Property',
            actionBy: req.user._id,
            actionDescription: `Propiedad de by ${update.builder}, ${update.subdivision} was added a file by ${req.user._id}`
        }
        TimeLine.create(event)
        logger.info('[Properties, updateDocument] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Properties,updateDocument]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to update a property by id
 * @param {MongoId} idProperty
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const setDefaulImage = async(req, res = response) => {
    logger.verbose('[Properties, setDefaulImage]', 'Update Document by admin')
    const {
        id
    } = req.params;
    logger.debug(`Property _id: ${id}`)
    try {

        const update = await Property.findById(id)

        update.image = update.attachments.id(req.body.id).file

        await update.save()
        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Property',
            actionBy: req.user._id,
            actionDescription: `Propiedad de by ${update.builder}, ${update.subdivision} was added a file by ${req.user._id}`
        }
        TimeLine.create(event)
        logger.info('[Properties, setDefaulImage] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Properties,setDefaulImage]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to update a property by id
 * @param {MongoId} idProperty
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const uploadDefaulImage = async(req, res = response) => {
    logger.verbose('[Properties, updateDocument]', 'Update Document by admin')
    const { id } = req.params;
    logger.debug(`Property _id: ${id}`)
    const { category } = req.body;
    const file = req.file

    try {
        const filetype = /application\/pdf/;
        const extname = filetype.test(file.mimetype)
        const fileData = {
            name: file.filename,
            fileType: file.mimetype,
            category: category,
            file: file.path,
            createdBy: req.user._id
        }
        var attach = new Attachment(fileData)
        await attach.save();

        var propAttach = {
            default: 1,
            isPublic: false,
            file: attach._id,
            actionBy: req.user._id
        }
        const update = await Property.findById(id)
        const attachments = update.attachments

        attachments.push(propAttach)

        update.image = attach._id

        await update.save()
        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Property',
            actionBy: req.user._id,
            actionDescription: `Propiedad ${update.builder}, ${update.subdivision} was added a file by ${req.user._id}`
        }
        TimeLine.create(event)
        logger.info('[Properties, updateDocument] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Properties,updateDocument]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to update a property by id
 * @param {MongoId} idProperty
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const setPublicImage = async(req, res = response) => {
    logger.verbose('[Properties, setPublicImage]', 'Update Document by admin')
    const {
        id
    } = req.params;
    logger.debug(`Property _id: ${id}`)
    try {
        const update = await Property.findById(id)
        const attachments = update.attachments

        //attachments.filter(x => x.isPublic === true).map(x => x.isPublic = false)

        attachments.id(req.body.id).isPublic === true ?
            update.attachments.id(req.body.id).isPublic = false :
            update.attachments.id(req.body.id).isPublic = true

        await update.save()
        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Property',
            actionBy: req.user._id,
            actionDescription: `Propiedad de by ${update.builder}, ${update.subdivision} was modified a file by ${req.user._id}`
        }
        TimeLine.create(event)
        logger.info('[Properties, setPublicImage] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Properties,setPublicImage]', err)
        res.status(500).json(dataBase)
    }
}

/**
 * This method is to update a property by id
 * @param {MongoId} idProperty
 * @param {updateData} req.body
 * @return {json} json String
 * @author Carlos Ramírez
 */
const removeFile = async(req, res = response) => {
    logger.verbose('[Properties, removeFile]', 'Delete Document by admin')
    const {
        id
    } = req.params;
    logger.debug(`Property _id: ${id}`)
    try {
        const update = await Property.findById(id)

        update.attachments.remove(req.body.id)

        await update.save()
        const event = {
            date: dayjs().toDate(),
            actionType: 'UPDATE',
            target: 'Property',
            actionBy: req.user._id,
            actionDescription: `Archivo de ${update.builder} fue eliminado`
        }
        TimeLine.create(event)
        logger.info('[Properties, removeFile] Update Success')
        res.json(entityUpdate)

    } catch (err) {
        logger.error('[Properties,removeFile]', err)
        res.status(500).json(dataBase)
    }
}

// ///////////////////// PUBLICS ///////////////////////////////
/**
 * This method is for get a list of Properties
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const propertyPublishedGet = async(req = request, res = response) => {
    logger.verbose('[Properties, propertiesPublishedGet]', 'Get Properties List');
    const {
        page = 1, limit = 10
    } = req.query;
    const query = {
        status: true
    };

    const id = req.params.id
    logger.debug(id)
    var since = (limit * page) - limit

    const [property] = await Promise.all([
        Property.findById(id)
        .populate({
            path: 'attachments.file'
        })
    ])
    res.json({
        property
    });
};

/**
 * This method is for get a list of Properties
 * @param {number} since
 * @param {number} limit
 * @param {boolean} status   
 * @return {json} json String
 * @author Carlos Ramírez
 */
const propertiesPublishedFiltered = async(req = request, res = response) => {
    logger.verbose('[Properties, propertiesPublishedFiltered]', 'Get Public Properties List');
    const {
        page = 1, limit = 10
    } = req.query;

    const {
        operation,
        type,
        valueBed,
        valueTerrain,
        valueBath,
        valueCTerrain,
        valuePrice,
    } = req.body;

    var since = (limit * page) - limit
    logger.debug(JSON.stringify(req.body))
    let pipeline = [];

    if (type) {
        var aType = type.split('|');
        var pipe = []
        aType.forEach((e) => {
            pipe.push({
                businessType: e
            })
        })

        pipeline.push({
            $match: {
                $or: pipe
            }
        })
    }
    if (operation) {
        var aType = operation.split('|');
        var pipe = []

        logger.debug(operation)

        aType.forEach((e) => {
            pipe.push({
                type: e
            })
        })

        pipeline.push({
            $match: {
                $or: pipe
            }
        })
    }
    if (valueBed) {
        var value = valueBed.split('|');
        var pipe = []

        value.forEach((e) => {
            var min = parseInt(e.split(';')[0]);
            var max = parseInt(e.split(';')[1]);
            pipe.push({
                bedrooms: {
                    $gte: min,
                    $lte: max
                },
            })
        })

        pipeline.push({
            $match: {
                $or: pipe
            }
        })
    }

    if (valueBath) {
        var value = valueBath.split('|');
        var pipe = []

        value.forEach((e) => {
            var min = parseInt(e.split(';')[0]);
            var max = parseInt(e.split(';')[1]);
            pipe.push({
                bathrooms: {
                    $gte: min,
                    $lte: max
                },
            })
        })

        pipeline.push({
            $match: {
                $or: pipe
            }
        })
    }

    if (valueTerrain) {
        var value = valueTerrain.split('|');
        var pipe = []

        value.forEach((e) => {
            var min = parseInt(e.split(';')[0]);
            var max = parseInt(e.split(';')[1]);
            pipe.push({
                mtsland: {
                    $gte: min,
                    $lte: max
                },
            })
        })

        pipeline.push({
            $match: {
                $or: pipe
            }
        })
    }

    if (valueCTerrain) {
        var value = valueCTerrain.split('|');
        var pipe = []

        value.forEach((e) => {
            var min = parseInt(e.split(';')[0]);
            var max = parseInt(e.split(';')[1]);
            pipe.push({
                constructionmts: {
                    $gte: min,
                    $lte: max
                },
            })
        })

        pipeline.push({
            $match: {
                $or: pipe
            }
        })
    }

    if (valuePrice) {
        var value = valuePrice.split('|');
        var pipe = []

        value.forEach((e) => {
            var min = parseInt(e.split(';')[0]);
            var max = parseInt(e.split(';')[1]);
            pipe.push({
                price: {
                    $gte: parseFloat(min),
                    $lte: parseFloat(max)
                },
            })
        })

        pipeline.push({
            $match: {
                $or: pipe
            }
        })
    }

    pipeline.push({
        $match: {
            isPublished: true
        }
    })

    pipeline.push({
        $lookup: {
            from: 'attachments',
            localField: 'attachments.file',
            foreignField: '_id',
            as: 'documents'
        },
    })

    const [total, properties] = await Promise.all([
        (await Property.aggregate(pipeline)).length,
        Property.aggregate(pipeline)
    ])
    logger.debug(`Total Properties: ${total}`)
    res.json({
        total,
        properties
    });
};

module.exports = {
    propertiesGet,
    activeProperty,
    propertiesDelete,
    AddProperty,
    updatePropertyByAdmin,
    updateDocument,
    setDefaulImage,
    removeFile,
    setPublicImage,
    publishProperty,
    propertyPublishedGet,
    propertyGet,
    propertiesPublishedFiltered,
    getCoverImageProperty,
    uploadDefaulImage,
}