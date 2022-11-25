const {
    Schema,
    model
} = require('mongoose')

const BankCreditSchema = Schema({
    name: {
        type: String,
        required: true
    },
    nss: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

BankCreditSchema.methods.toJSON = function() {
    const {
        __v,
        ...bankCredit
    } = this.toObject()
    return bankCredit
}

module.exports = model('BankCredit', BankCreditSchema)