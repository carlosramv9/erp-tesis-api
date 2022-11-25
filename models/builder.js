const { Schema, model } = require('mongoose')

const BuilderSchema = Schema({
    name: {
        type: String,
        required: [true, 'The Name is Required'],
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

BuilderSchema.methods.toJSON = function() {
    const { __v, ...builder } = this.toObject()
    return builder
}

module.exports = model('Builder', BuilderSchema)