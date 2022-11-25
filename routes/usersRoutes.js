const { Router } = require('express');
const { check, oneOf, query } = require('express-validator');
const path = require('path');
const { v4 } = require('uuid');
//Default Data
const { users } = require('config').get('routes');
const { createPermissions, updatePermissions, deletePermissions, readPermissions } = require('config').get('permissionType');
//Controllers
const { usersGet, getUSerById, userRegister, activeUser, usersDelete, updateUser, adminUserAdd, updateUserPassword, updateUserByAdmin, userAuthGet, updateUserImage, getUserImage, usersInfoGet } = require('../controllers/usersController');
//middlewares
const { UserRole, permission } = require('../middlewares/RoleValidation');
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
//Validaciones
const { roleValidation, emailValidation, userValidationById } = require('../database/db.validators');

const maxSize = 20 * 1024 * 1024

//files
const multer = require('multer')
const storage = multer.diskStorage({
    destination: './assets',
    limits: { fileSize: maxSize },
    filename: (req, file, cb) => {
        cb(null, v4() + path.extname(file.originalname).toLocaleLowerCase())
    }
})
const uploadFile = multer({ storage, dest: './assets', limits: { fileSize: maxSize } })

//Ruta de Usuarios
const router = Router();
////////////////////////////////////Get////////////////////////////////////
router.get('/', [
    jwtValidation,
    permission(readPermissions, users),
    validationFields
], usersGet);

router.get('/info', [
    jwtValidation,
    validationFields
], usersInfoGet);

router.get('/auth', [
    jwtValidation,
    validationFields
], userAuthGet);

router.get('/:userId', [
    jwtValidation,
    check('userId', 'The id is required'),
    validationFields
], getUSerById);

router.get('/image/:userId', [
    jwtValidation,
    check('userId', 'The id is required'),
    validationFields
], getUserImage)

////////////////////////////////////Post////////////////////////////////////
router.post('/', [
    check('firstName', 'The name is required').notEmpty(),
    check('lastName', 'The name is required').notEmpty(),
    check('birthDate', 'Add a valid date for birthdate').isDate(),
    check('password', 'The password is RequireD').isLength({ min: 6 }),
    check('email', 'The email is not Valid').isEmail(),
    check('email').custom(emailValidation),
    check('role', 'you shall no pass brow :)').isEmpty(),
    validationFields
], userRegister);

router.post('/userbyadminpanel', [
    jwtValidation,
    permission(createPermissions, users),
    check('firstName', 'The name is required').notEmpty(),
    check('lastName', 'The name is required').notEmpty(),
    check('birthDate', 'Add a valid date for birthdate').isDate(),
    check('password', 'The password is RequireD').isLength({ min: 6 }),
    check('email', 'The email is not Valid').isEmail(),
    check('email').custom(emailValidation),
    check('role', 'Add the User role').notEmpty(),
    check('role').optional().custom(roleValidation).isMongoId(),
    validationFields
], adminUserAdd)

router.post('/updateimage/:userId', [
    jwtValidation,
    permission(updatePermissions, users),
    check('userId', 'The User Id is required').isMongoId().notEmpty(),
    uploadFile.single('file'),
    validationFields
], updateUserImage);

////////////////////////////////////Update////////////////////////////////////
router.put('/:id', [
    jwtValidation,
    permission(updatePermissions, users),
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(userValidationById),
    check('role').optional().custom(roleValidation),
    validationFields
], updateUserByAdmin);

router.put('/', [
    jwtValidation,
    UserRole('ADMIN_ROLE', 'USER_ROLE'),
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(userValidationById),
    check('role').optional().custom(roleValidation),
    validationFields
], updateUser);

router.put('/active/:id', [
    jwtValidation,
    UserRole('ADMIN_ROLE'),
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(userValidationById),
    validationFields
], activeUser);

router.put('/password', [
    jwtValidation,
    UserRole('ADMIN_ROLE', 'USER_ROLE'),
    check('password', 'The password is empty').notEmpty(),
    check('newPassword', 'The newPassword is empty').notEmpty(),
    validationFields
], updateUserPassword)

////////////////////////////////////Delete////////////////////////////////////
router.delete('/:id', [
    jwtValidation,
    permission(deletePermissions, users),
    check('id', 'Is not a valid mongoID').isMongoId(),
    check('id').custom(userValidationById),
    validationFields
], usersDelete);

module.exports = router;