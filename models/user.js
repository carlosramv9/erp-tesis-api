const { Schema, model } = require('mongoose')

const UserSchema = Schema({
    firstName: {
        type: String,
        required: [true, 'The FirstName is Required'],
    },
    lastName: {
        type: String,
        required: [true, 'The Last Name is Required'],
    },
    rfc: {
        type: String,
        min: 12,
        max: 13,
        required: [true, 'User rfc is required']
    },
    nss: {
        type: String,
        min: 11,
        max: 11,
        required: [true, 'User nss is required']
    },
    address: {
        type: String,
        min: 1,
        required: [true, 'User address is required']
    },
    baseCommission: {
        type: Number,
        required: [true, 'User baseComision is required']
    },
    salary: {
        type: Number,
        required: [true, 'User salary is required']
    },
    entryDate: {
        type: Date,
        required: ['The User Entry date is Required'],
    },
    birthDate: {
        type: Date,
        required: ['The User Birthdate is Required'],
    },
    email: {
        type: String,
        required: [true, 'The Email is required'],
        unique: true,
    },
    personalEmail: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'The Password is Required'],
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: 'Attachment'
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
    },
    attachments: {
        type: [Schema.Types.ObjectId],
        ref: 'Attachment'
    },
    status: {
        type: Boolean,
        default: true,
    }
})

UserSchema.methods.toJSON = function() {
    const { __v, password, ...user } = this.toObject()
    return user
}

module.exports = model('User', UserSchema)