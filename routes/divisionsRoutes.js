const { Router } = require('express');
const { check } = require('express-validator');

//Controlador
const { divisionsGet, AddDivisionAdmin, divisionsDelete, AddDivision, updateDivisionByAdmin } = require('../controllers/divisionController');
//Middlewares
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
//Validaciones
const { emailValidation, divisionValidationById } = require('../database/db.validators');
//Ruta de Usuarios
const router = Router();

////////////////////////////////////Get////////////////////////////////////
router.get('/', [jwtValidation, validationFields], divisionsGet);
////////////////////////////////////Post////////////////////////////////////
router.post('/', [
    jwtValidation,
    check('name', 'The name is required').notEmpty(),
    validationFields
], AddDivision);

router.post('/divisionbyadminpanel', [
    jwtValidation,
    check('name', 'The name is required').notEmpty(),
    validationFields
], AddDivisionAdmin)

////////////////////////////////////Update////////////////////////////////////
router.put('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(divisionValidationById),
    validationFields
], updateDivisionByAdmin);
////////////////////////////////////Delete////////////////////////////////////
router.delete('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(divisionValidationById),
    validationFields
], divisionsDelete);

module.exports = router;