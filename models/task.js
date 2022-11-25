const { Schema, model } = require('mongoose')

const TaskSchema = Schema({
    index: {
        type: Number,
        required: [true, 'The index of the Task is required']
    },
    name: {
        type: String,
        required: [true, 'The name of the task is required']
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['process', 'onHold', 'complete'],
        default: 'process'
    },
    note: {
        type: String
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['appointment', 'attachment', 'contract'],
        required: [true, 'The Type of task is required']
    },
    data: {
        type: Schema.Types.ObjectId,
        refPath: 'type',
        required: [true, 'The file path is required'],
    },
    createdBy: {

    },
    updatedBy: {

    }
})

TaskSchema.methods.toJSON = function() {
    const { __v, ...task } = this.toObject()
    return task;
}

module.exports = model('Task', TaskSchema)