const {
    Schema,
    model
} = require('mongoose')

const ContactSchema = Schema({
    name: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    }
})

ContactSchema.methods.toJSON = function () {
    const {
        __v,
        ...contact
    } = this.toObject()
    return contact
}

module.exports = model('Contact', ContactSchema)
module.exports = ContactSchema