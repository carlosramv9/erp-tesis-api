const {
    Schema,
    model
} = require('mongoose')
const Contact = require('./contacts')

const DivisionSchema = Schema({
    name: {
        type: String,
        required: [true, 'The FirstName is Required'],
    },
    closer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    builder: {
        type: Schema.Types.ObjectId,
        ref: 'Builder',
    },
    commission: {
        type: Number,
        default: 0,
    },
    commissionType: {
        type: String,
        enum: ['percentage', 'currency'],
        default: 'percentage',
    },
    contacts: [Contact],
    status: {
        type: Boolean,
        default: true,
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})

DivisionSchema.methods.toJSON = function() {
    const {
        __v,
        ...division
    } = this.toObject()
    return division
}

module.exports = model('Division', DivisionSchema)