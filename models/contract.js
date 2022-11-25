const { Schema, model } = require('mongoose')

const ContractSchema = Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'The customer of the contract is required'],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'The user of the contract is required'],
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, 'The date of the contract is required'],
    },
    type: {
        type: String,
        required: [true, 'the contract type of the contract is required']
    },
    file: {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [true, 'The file path is required'],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})

ContractSchema.methods.toJSON = function() {
    const { __v, ...contract } = this.toObject()
    return contract
}

module.exports = model('Contract', ContractSchema)