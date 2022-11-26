const { Schema, model } = require('mongoose');

const taskTemplateSchema = new Schema({
    index: {
        type: Number,
        required: true
    },
    dndId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: [true, 'The name of task is required'],
    },
    description: {
        type: String,
        required: [true, 'The name of task is required'],
    },
    type: {
        type: String,
        enum: ['Appointment', 'Attachment', 'Contract', 'dataUpdate'],
        required: [true, 'The type of Task is required'],
    },
    isRequired: {
        type: Boolean,
        default: true
    }
});

const stepTemplateSchema = new Schema({
    index: {
        type: Number,
        required: true
    },
    dndId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: [true, 'The name of task is required'],
    },
    totalTasks: {
        type: Number,
        required: [true, 'The totalTask per step is required'],
    },
    tasks: {
        type: [taskTemplateSchema],
        required: [true, 'The tasks per step are required']
    }
});

const ProcessTemplateSchema = Schema({
    name: {
        type: String,
        required: [true, 'The name of the process is required']
    },
    type: {
        type: String,
        enum: ['new', 'used'],
        required: [true, 'type of process is required']
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'createdBy is required']
    },
    createdDate: {
        type: Date,
        default:Date.now
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentMethod: {
        type: String,
        enum: ['mix', 'counted', 'credit']
    },
    totalSteps: {
        type: Number,
        default: 8
    },
    isActive: {
        type: Boolean,
        default: true
    },
    steps: {
        type: [stepTemplateSchema],
        required: [true, 'The steps of the process are required']
    }
});

ProcessTemplateSchema.methods.toJSON = function() {
    const { __v, ...processTemplate } = this.toObject();
    return processTemplate;
}

module.exports = model('ProcessTemplate', ProcessTemplateSchema)