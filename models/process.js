const { Schema, model } = require('mongoose');

const ProcessSchema = Schema({
    processTemplate: {
        type: Schema.Types.ObjectId,
        ref: 'ProcessTemplate',
        required: [true, 'The processTemplate in process is required']
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'The customer in process is required']
    },
    type: {
        type: String,
        enum: ['new', 'used'],
        required: [true, 'type of process is required']
    },
    property: {
        type: Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'The property on the process is required']
    },
    mainManager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'createdBy is required']
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentMethod: {
        type: String,
        enum: ['mix', 'counted', 'credit']
    },
    currentStep: {
        type: Number,
        default: 1
    },
    totalSteps: {
        type: Number,
        default: 8
    },
    currentStepName: {
        type: String,
        required: [true, 'the current Step name is required']
    },
    status: {
        type: String,
        enum: ['inProgress', 'canceled', 'finished'],
        default: 'inProgress'
    },
    statusName: {
        type: String,
        enum: ['En Progreso', 'Cancelado', 'Finalizado'],
        default: 'En Progreso'
    },
    steps: {
        type: [Schema.Types.ObjectId],
        ref: 'Step',
    }
});

ProcessSchema.methods.toJSON = function() {
    const { __v, ...process } = this.toObject();
    return process;
}

module.exports = model('Process', ProcessSchema)