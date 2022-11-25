const { Router } = require('express');
const { check } = require('express-validator');

//Controlador
const { getLatestCustomers, getPastDueProperties } = require('../controllers/dashboardController');
//Middlewares
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
//Validaciones
const { emailValidation, categoryValidationById } = require('../database/db.validators');
//Ruta de Usuarios
const router = Router();

////////////////////////////////////Get////////////////////////////////////
router.get('/customers/latest', [jwtValidation], getLatestCustomers);
router.get('/properties/pastdue', [jwtValidation], getPastDueProperties);
////////////////////////////////////Post////////////////////////////////////
// router.post('/', [
//     jwtValidation,
//     check('name', 'The name is required').notEmpty(),
//     // check('lastName', 'The name is required').notEmpty(),
//     // check('type', 'The Category type of category is Required').notEmpty(),
//     // check('nss', 'The NSS is Required').notEmpty(),
//     // check('rfc', 'The RFC is required').notEmpty(),
//     // check('email').custom(emailValidation),
//     validationFields
// ], AddCategory);

////////////////////////////////////Update////////////////////////////////////
// router.put('/:id', [
//     jwtValidation,
//     check('id', 'Is not a valid mongoID').isMongoId(),
//     check('id').custom(categoryValidationById),
//     validationFields
// ], updateCategoryByAdmin);
////////////////////////////////////Delete////////////////////////////////////
// router.delete('/:id', [
//     jwtValidation,
//     check('id', 'Is not a valid mongoID').isMongoId(),
//     check('id').custom(categoryValidationById),
//     validationFields
// ], categoriesDelete);

module.exports = router;