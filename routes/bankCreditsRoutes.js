const { Router } = require('express');
const { check } = require('express-validator');

//Controlador
const { bankCreditsGet, AddBankCreditAdmin, bankCreditsDelete, AddBankCredit, updateBankCreditByAdmin } = require('../controllers/bankCreditsController');
//Middlewares
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
//Validaciones
const { emailValidation, bankCreditValidationById } = require('../database/db.validators');
//Ruta de Usuarios
const router = Router();

////////////////////////////////////Get////////////////////////////////////
router.get('/', [jwtValidation, validationFields], bankCreditsGet);
////////////////////////////////////Post////////////////////////////////////
router.post('/', [
    jwtValidation,
    check('name', 'The name is required').notEmpty(),
    validationFields
], AddBankCredit);

router.post('/bankCreditbyadminpanel', [
    jwtValidation,
    check('name', 'The name is required').notEmpty(),
    validationFields
], AddBankCreditAdmin)

////////////////////////////////////Update////////////////////////////////////
router.put('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(bankCreditValidationById),
    validationFields
], updateBankCreditByAdmin);
////////////////////////////////////Delete////////////////////////////////////
router.delete('/:id', [
    jwtValidation,
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(bankCreditValidationById),
    validationFields
], bankCreditsDelete);

module.exports = router;