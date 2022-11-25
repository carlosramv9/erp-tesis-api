const { Router } = require('express');
const { check } = require('express-validator');

//Controlador
const { buildersGet, AddBuilderAdmin, buildersDelete, AddBuilder, updateBuilderByAdmin } = require('../controllers/buildersController');
//Middlewares
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
//Validaciones
const { emailValidation, builderValidationById } = require('../database/db.validators');
//Ruta de Usuarios
const router = Router();

////////////////////////////////////Get////////////////////////////////////
router.get('/', [jwtValidation, validationFields], buildersGet);
////////////////////////////////////Post////////////////////////////////////
router.post('/', [
    jwtValidation,
    check('name', 'The name is required').notEmpty(),
    validationFields
], AddBuilder);

router.post('/builderbyadminpanel', [
    jwtValidation,
    check('name', 'The name is required').notEmpty(),
    validationFields
], AddBuilderAdmin)

////////////////////////////////////Update////////////////////////////////////
router.put('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(builderValidationById),
    validationFields
], updateBuilderByAdmin);
////////////////////////////////////Delete////////////////////////////////////
router.delete('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(builderValidationById),
    validationFields
], buildersDelete);

module.exports = router;