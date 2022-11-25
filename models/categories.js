const { Schema, model } = require('mongoose')

const CategorySchema = Schema({
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

CategorySchema.methods.toJSON = function() {
    const { __v, ...categories } = this.toObject()
    return categories
}

module.exports = model('Category', CategorySchema)