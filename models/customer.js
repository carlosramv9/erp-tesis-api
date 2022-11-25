const { Schema, model } = require('mongoose')

const CustomerSchema = Schema({
    firstName: {
        type: String,
        required: [true, 'The FirstName is Required'],
    },
    lastName: {
        type: String,
        required: [true, 'The Last Name is Required'],
    },
    type: {
        type: String,
        required: [true, 'The Customer type of customer is Required'],
    },
    nss: {
        type: String,
    },
    curp: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    creditsType: {
        type: Schema.Types.ObjectId,
        ref: 'BankCredit',
        required: false
    },
    creditsAmount: {
        type: String,
    },
    idEmployee: {
        type: Array,
        ref: 'User',
    },
    address: {
        type: String,
    },
    registedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: true,
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})

CustomerSchema.methods.toJSON = function() {
    const { __v, ...customer } = this.toObject()
    return customer
}

module.exports = model('Customer', CustomerSchema)