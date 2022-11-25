const { Router } = require('express');
const { check } = require('express-validator');

//Default Data
const { roles } = require('config').get('routes');
const { createPermissions, updatePermissions, deletePermissions, readPermissions } = require('config').get('permissionType');
//Controlllers
const { newRole, rolesList, updateRole, deleteRole } = require('../controllers/rolesController');
//Validator
const { uniqueRoleValidation, roleRoutesValidation, roleValidation } = require('../database/db.validators');
//middlewares
const { permission } = require('../middlewares/RoleValidation');
const { validationFields } = require('../middlewares/validation-fields');
const { jwtValidation } = require('../middlewares/webtokenValidation');
const router = Router();
////////////////////////////////////Get////////////////////////////////////
router.get('/', [
    jwtValidation,
    permission(readPermissions, roles),
    validationFields
], rolesList);

////////////////////////////////////Post////////////////////////////////////
router.post('/', [
    jwtValidation,
    permission(createPermissions, roles),
    check('role', 'The name of the role is required').notEmpty(),
    check('role').custom(uniqueRoleValidation),
    check('createPermissions').optional().isArray().custom(roleRoutesValidation),
    check('updatePermissions').optional().isArray().custom(roleRoutesValidation),
    check('deletePermissions').optional().isArray().custom(roleRoutesValidation),
    check('readPermissions').optional().isArray().custom(roleRoutesValidation),
    validationFields
], newRole);

////////////////////////////////////Update////////////////////////////////////
router.put('/:id', [
    jwtValidation,
    permission(updatePermissions, roles),
    check('id', 'Is not a valid mongoID').isMongoId().custom(uniqueRoleValidation),
    check('role').optional().isString(),
    check('createPermissions').optional().isArray().custom(roleRoutesValidation),
    check('updatePermissions').optional().isArray().custom(roleRoutesValidation),
    check('deletePermissions').optional().isArray().custom(roleRoutesValidation),
    check('readPermissions').optional().isArray().custom(roleRoutesValidation),
    validationFields
], updateRole);

////////////////////////////////////Delete////////////////////////////////////
router.delete('/:id', [
    jwtValidation,
    permission(deletePermissions, roles),
    check('id', 'Is not a valid mongoID').isMongoId().custom(roleValidation),
    validationFields
], deleteRole);

module.exports = router;