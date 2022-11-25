const { Schema, model } = require('mongoose')

const AppointmentSchema = Schema({
    place: {
        type: String,
        required: [true, 'The address of the appointment is required'],
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, 'The date of the appointment is required'],
    },
    attended: {
        type: Boolean,
        default: false
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'The customer of the appointment is required'],
    },
    participants: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: [true, 'At least one participant is needed'],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})

AppointmentSchema.methods.toJSON = function() {
    const { __v, ...appointment } = this.toObject()
    return appointment
}

module.exports = model('Appointment', AppointmentSchema)