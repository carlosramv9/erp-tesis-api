const { v4 } = require('uuid');
const path = require('path')
const { Router } = require('express');
const { check } = require('express-validator');

//Controlador
const { propertiesGet, propertiesDelete, AddProperty, updatePropertyByAdmin, updateDocument, setDefaulImage, removeFile, setPublicImage, publishProperty, getCoverImageProperty, propertyGet, uploadDefaulImage } = require('../controllers/propertiesController');
//Middlewares
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
//Validaciones
const { propertyValidationById } = require('../database/db.validators');
const maxSize = 20 * 1024 * 1024
    //Ruta de Usuarios
const router = Router();

//files
const multer = require('multer')
let convertPdfToPng = require('pdf2pic').fromPath;
const logger = require("../libs/logger").logger;

const storage = multer.diskStorage({
    destination: 'assets', //'assets/properties',
    limits: { fileSize: maxSize },
    filename: (req, file, cb) => {
        var id = v4()
        var name = id + path.extname(file.originalname).toLocaleLowerCase()
        var regex = /pdf/
        var extension = regex.test(path.extname(file.originalname).toLocaleLowerCase())

        // if(extension){
        //     const store = convertPdfToPng(file.path, {
        //         density: 100,
        //         saveFilename: id,
        //         savePath: "assets/properties",
        //         format: "png",
        //         width: 600,
        //         height: 600
        //     })
        //     const page = 1;
        //     store(page).then((resolve) => {
        //         logger.debug("Page 1 is now converted as image");

        //         return resolve;
        //     });
        // }

        cb(null, name)
    },
})
const mdUploadImage = multer({ storage, dest: 'assets/properties', limits: { fileSize: maxSize } }).single('img')

////////////////////////////////////Get////////////////////////////////////
router.get('/', [jwtValidation], propertiesGet);

router.get('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(propertyValidationById),
], propertyGet);

router.get('/image/:id', [
        jwtValidation,
        check('id', 'The id is required'),
        validationFields
    ], getCoverImageProperty)
    ////////////////////////////////////Post////////////////////////////////////
router.post('/', [jwtValidation, mdUploadImage,
    //jwtValidation,
    //check('subdivision', 'The subdivision is required').notEmpty(),
    check('constructionmts', 'The construction mts of property is Required').notEmpty(),
    check('mtsland', 'The mts of land is Required').notEmpty(),
    check('equipment', 'The equipment is required').notEmpty(),
    //check('creditsAmount', 'The credits Amount is required').notEmpty(),
    //check('appraisal', 'The appraisal is required').notEmpty(),
    //check('deliveryTime', 'The delivery Time is required').notEmpty(),
    //check('credits', 'The credits is required').notEmpty(),
    check('floors', 'The number of floors is required').notEmpty(),
    check('bedrooms', 'The number of bedrooms is required').notEmpty(),
    check('bathrooms', 'The number of bathrooms is required').notEmpty(),
    validationFields
], AddProperty);
////////////////////////////////////Update////////////////////////////////////
router.put('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(propertyValidationById),
    validationFields
], updatePropertyByAdmin);

router.put('/publish/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(propertyValidationById),
    validationFields
], publishProperty);

router.put('/files/upload/:id', [jwtValidation, mdUploadImage], updateDocument)

router.put('/files/upload/cover/:id', [jwtValidation, mdUploadImage], uploadDefaulImage)

router.put('/files/setimage/:id', [jwtValidation], setDefaulImage)

router.put('/files/setimage/public/:id', [jwtValidation], setPublicImage)
    ////////////////////////////////////Delete////////////////////////////////////
router.delete('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(propertyValidationById),
    validationFields
], propertiesDelete);

router.put('/files/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    validationFields
], removeFile)

module.exports = router;