const { Schema, model } = require('mongoose')

const StepSchema = Schema({
    index: {
        type: Number,
        required: [true, 'The index of the Step is required'],
    },
    name: {
        type: String,
        required: [true, 'The name of the step is required'],
    },
    status: {
        type: String,
        enum: ['process', 'onHold', 'complete'],
        default: 'process'
    },
    aditionalAttachments: {
        type: [Schema.Types.ObjectId],
        ref: 'Attachment'
    },
    tasks: {
        type: [Schema.Types.ObjectId],
        ref: 'Task'
    },
    comments: {
        type: [Schema.Types.ObjectId],
        ref: 'Comment'
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
})

StepSchema.methods.toJSON = function() {
    const { __v, ...step } = this.toObject()
    return step;
}

module.exports = model('Step', StepSchema)