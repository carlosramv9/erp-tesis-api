const { Schema, model } = require('mongoose');
const { permissionList } = require('config')

const RoleSchema = Schema({
    role: {
        type: String,
        required: [true, 'The role is required']
    },
    createPermissions: {
        type: [String],
        enum: permissionList,
        default: [],
    },
    updatePermissions: {
        type: [String],
        enum: permissionList,
        default: []
    },
    deletePermissions: {
        type: [String],
        enum: permissionList,
        default: []

    },
    readPermissions: {
        type: [String],
        enum: permissionList,
        default: []
    },
    priority: {
        type: String,
        enum: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'default'],
        default: 'default'

    },
    index: {
        type: Number,
    }
});

RoleSchema.methods.toJSON = function() {
    const { __v, ...role } = this.toObject()
    return role
}

module.exports = model('Role', RoleSchema);