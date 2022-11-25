const {
    Router
} = require('express');
const {
    check
} = require('express-validator');
//Default Data
const {
    customers
} = require('config').get('routes');
const {
    createPermissions,
    updatePermissions,
    deletePermissions,
    readPermissions
} = require('config').get('permissionType');
//Controladores
const {
    customersGet,
    AddCustomerAdmin,
    customersDelete,
    AddCustomer,
    updateCustomerByAdmin,
} = require('../controllers/customersController');
//Middlewares
const {
    validationFields
} = require('../middlewares/validation-fields');
const {
    jwtValidation
} = require('../middlewares/webtokenValidation');
const {
    permission
} = require('../middlewares/RoleValidation');
//Validaciones
const { emailValidation, customerValidationById, customerEmailValidation } = require('../database/db.validators');
//Ruta de Usuarios
const router = Router();

////////////////////////////////////Get////////////////////////////////////
router.get('/', [
    jwtValidation,
    permission(readPermissions, customers),
    validationFields
], customersGet);
////////////////////////////////////Post////////////////////////////////////
router.post('/', [
    jwtValidation,
    permission(createPermissions, customers),
    check('firstName', 'The name is required').notEmpty(),
    check('lastName', 'The name is required').notEmpty(),
    check('type', 'The Customer type of customer is Required').notEmpty(),
    check('curp', 'The CURP of customer is Required').notEmpty(),
    validationFields
], AddCustomer);

router.post('/customerbyadminpanel', [
    jwtValidation,
    permission(createPermissions, customers),
    check('firstName', 'The name is required').notEmpty(),
    check('lastName', 'The name is required').notEmpty(),
    check('type', 'The Customer type of customer is Required').notEmpty(),
    check('email').custom(emailValidation),
    validationFields
], AddCustomerAdmin)

////////////////////////////////////Update////////////////////////////////////
router.put('/:id', [
    jwtValidation,
    permission(updatePermissions, customers),
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(customerValidationById),
    validationFields
], updateCustomerByAdmin);
////////////////////////////////////Delete////////////////////////////////////
router.delete('/:id', [
    jwtValidation,
    permission(deletePermissions, customers),
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(customerValidationById),
    validationFields
], customersDelete);

module.exports = router;