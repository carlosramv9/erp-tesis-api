const {
    Schema,
    model
} = require('mongoose')

const DocumentSchema = Schema({
    isPublic: {
        type: Boolean,
        default: false,
    },
    file: {
        type: Schema.Types.ObjectId,
        ref: 'Attachment'
    },
    releaseDate: {
        type: Date,
        default: new Date().toISOString()
    },
    actionBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "The user who doing the action is required"],
    },
})

DocumentSchema.methods.toJSON = function () {
    const {
        __v,
        ...document
    } = this.toObject()
    return document
}

module.exports = model('Document', DocumentSchema)
module.exports = {
    DocumentSchema
}