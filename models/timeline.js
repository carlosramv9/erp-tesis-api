const { Schema, model } = require('mongoose')
const { timeLineTarget } = require('config')
const TimeLineSchema = Schema({
    date: {
        type: Date,
        required: [true, 'The date of the action is required']
    },
    actionType: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'ACTIVE'],
        required: [true, 'The action type is required']
    },
    target: {
        type: String,
        enum: timeLineTarget,
        required: true
    },
    actionBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "The user who doing the action is required"],
    },
    actionDescription: {
        type: String,
        required: [true, 'The description of the action es Required']
    }
}, { timestamps: false, collection: 'timeline' })

TimeLineSchema.methods.toJSON = function() {
    const { __v, ...TimeLine } = this.toObject();
    return TimeLine;
}

module.exports = model('TimeLine', TimeLineSchema)