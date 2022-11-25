const { Router } = require('express');
const { check } = require('express-validator');

//Controlador
const { buildModelsGet, AddBuildModelAdmin, buildModelsDelete, AddBuildModel, updateBuildModelByAdmin } = require('../controllers/buildModelController');
//Middlewares
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
//Validaciones
const { emailValidation, buildModelValidationById } = require('../database/db.validators');
//Ruta de Usuarios
const router = Router();

////////////////////////////////////Get////////////////////////////////////
router.get('/', [jwtValidation, validationFields], buildModelsGet);
////////////////////////////////////Post////////////////////////////////////
router.post('/', [
    jwtValidation,
    
], AddBuildModel);

router.post('/buildModelbyadminpanel', [
    jwtValidation,
    check('name', 'The name is required').notEmpty(),
    validationFields
], AddBuildModelAdmin)

////////////////////////////////////Update////////////////////////////////////
router.put('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(buildModelValidationById),
    validationFields
], updateBuildModelByAdmin);
////////////////////////////////////Delete////////////////////////////////////
router.delete('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(buildModelValidationById),
    validationFields
], buildModelsDelete);

module.exports = router;