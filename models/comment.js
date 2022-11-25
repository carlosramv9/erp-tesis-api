const { Schema, model } = require('mongoose')

const CommentsSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'The user of the comment is required']
    },
    date: {
        type: Date,
        required: [true, 'The date is required'],
    },
    comment: {
        type: String,
        required: [true, 'The comment is required'],
    }
})

CommentsSchema.methods.toJSON = function() {
    const { __v, ...comment } = this.toObject()
    return comment;
}

module.exports = model('Comment', CommentsSchema)