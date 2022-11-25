const { Router } = require('express');
const { check } = require('express-validator');
const path = require('path');
const { v4 } = require('uuid');
//Default Data
const { process } = require('config').get('routes');
const { createPermissions, updatePermissions, deletePermissions, readPermissions } = require('config').get('permissionType');
//Controllers
const { newProcess, listProcess, newTask, processGetById } = require('../controllers/processController');
//middlewares
const { permission } = require('../middlewares/RoleValidation');
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
//Validaciones

//files
const multer = require('multer');
const { processValidationById } = require('../database/db.validators');
const storage = multer.diskStorage({
    destination: './assets',
    filename: (req, file, cb) => {
        cb(null, v4() + path.extname(file.originalname).toLocaleLowerCase())
    }
})
const uploadFile = multer({ storage, dest: './assets' })


const router = Router();
////////////////////////////////////Get////////////////////////////////////
router.get('/', [
    jwtValidation,
    permission(readPermissions, process),
    validationFields
], listProcess);

router.get('/:id', [
    jwtValidation,
    permission(readPermissions, process),
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(processValidationById),
    validationFields
], processGetById);

////////////////////////////////////Post////////////////////////////////////
router.post('/', [
    jwtValidation,
    permission(createPermissions, process),
    check('processTemplate', 'The process template id is required').notEmpty().isMongoId(),
    check('customer', 'The customer id is required').notEmpty().isMongoId(),
    check('property', 'The property id is required').notEmpty().isMongoId(),
    validationFields
], newProcess);

////////////////////////////////////Put////////////////////////////////////
router.put('/nextstep/:processId', [
    jwtValidation,
    permission(updatePermissions, process),
    check('index').notEmpty().isNumeric(),
    check('customer', 'The customer id is required').notEmpty().isMongoId(),
    check('property', 'The property id is required').notEmpty().isMongoId(),
    validationFields
], newProcess);

router.put('/addtask/:stepId/:processTemplateId', [
    jwtValidation,
    permission(updatePermissions, process),
    uploadFile.single('taskFile'),
    validationFields
], newTask);

module.exports = router;