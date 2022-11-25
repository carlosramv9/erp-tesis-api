const {
    Schema,
    model
} = require('mongoose')

const BuildModelSchema = Schema({
    name: {
        type: String,
        required: [true, 'The address of the attachment  is required'],
    },
    description: {
        type: String,
    },
    division: {
        type: Schema.Types.ObjectId,
        ref: 'Division',
    },
    type: {
        type: String,
        enum: ['terrain', 'house'],
        required: [true, 'The type of model is Required'],
    },
    floors: {
        type: Number,
        required: [true, 'The Number of Floors is Required'],
    },
    bedrooms: {
        type: Number,
        required: [true, 'The Number of bedrooms is Required'],
    },
    bathrooms: {
        type: Number,
        required: [true, 'The Number of bathrooms is Required'],
    },
    halfbathrooms: {
        type: Number,
        required: [true, 'The Number of bathrooms is Required'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: Boolean,
        default: true,
    },
})

BuildModelSchema.methods.toJSON = function () {
    const {
        __v,
        ...attachment
    } = this.toObject()
    return attachment
}

module.exports = model('BuildModel', BuildModelSchema)