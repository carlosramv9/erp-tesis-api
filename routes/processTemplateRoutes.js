const { Router } = require('express');
const { check } = require('express-validator');

//Default Data
const { processTemplates } = require('config').get('routes');
const { createPermissions, updatePermissions, deletePermissions, readPermissions } = require('config').get('permissionType');
//Controllers
const { newProcessTemplate, listProcessTemplate, getProcessTemplateById, deleteProcessTemplate, activeProcessTemplate, updateProcessTemplate } = require('../controllers/processTemplateController');
//middlewares
const { permission } = require('../middlewares/RoleValidation');
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
//Validaciones
const router = Router();

const processTemplateTypes = require('config').get('processTemplateTypes');
const paymentMethods = require('config').get('paymentMethods');

////////////////////////////////////Get////////////////////////////////////
router.get('/', [
    jwtValidation,
    permission(readPermissions, processTemplates),
    validationFields
], listProcessTemplate);

router.get('/:processTemplateId', [
    jwtValidation,
    permission(readPermissions, processTemplates),
    check('processTemplateId', 'THe name of process template is required and valid').isMongoId().notEmpty(),
    validationFields
], getProcessTemplateById);

////////////////////////////////////Post////////////////////////////////////
router.post('/', [
    jwtValidation,
    permission(createPermissions, processTemplates),
    check('name', 'The name of process template is required').notEmpty(),
    check('type', 'The type is required').notEmpty().isIn(processTemplateTypes),
    check('paymentMethod', 'the payment method is required').notEmpty().isIn(paymentMethods),
    check('steps', 'The steps is reuquired').notEmpty().isArray(),
    check('steps.tasks', 'The tasks per step is required').notEmpty().isArray(),
], newProcessTemplate);

////////////////////////////////////Put/////////////////////////////////////
router.put('/active/:processTemplateId', [
    jwtValidation,
    permission(updatePermissions, processTemplates),
    check('processTemplateId', 'The id of process template is required and valid').isMongoId(),
], activeProcessTemplate)

router.put('/:processTemplateId', [
    jwtValidation,
    permission(updatePermissions, processTemplates),
    check('processTemplateId', 'The id of process template is required and valid').isMongoId(),
], updateProcessTemplate)

////////////////////////////////////Delete//////////////////////////////////
router.delete('/:processTemplateId', [
    jwtValidation,
    permission(deletePermissions, processTemplates),
    check('processTemplateId', 'The id of process template is required and valid').isMongoId(),
], deleteProcessTemplate)

module.exports = router;