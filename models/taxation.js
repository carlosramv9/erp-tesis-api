const {
    Schema,
    model
} = require('mongoose')

const TaxationSchema = Schema({
    type: {
        type: String,
        required: [true, 'The Type of taxation is Required'],
    },
    total: {
        type: Number,
        default: 0
    }
})

TaxationSchema.methods.toJSON = function () {
    const {
        __v,
        ...taxation
    } = this.toObject()
    return taxation
}

const GeneralSchema = Schema({
    name: {
        type: String
    },
    value: {
        type: Number
    },
    chargeTo:{
        type: String,
        enum: ["owner", "realestate"],
        default: 'realestate'
    }
})

module.exports = {
    TaxationSchema,
    GeneralSchema
}