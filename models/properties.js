const {
    Schema,
    model
} = require('mongoose')
const {
    DocumentSchema
} = require('./document')
const {
    TaxationSchema,
    GeneralSchema
} = require('./taxation')

const PropertiesSchema = Schema({
    title: { /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        type: String
    },
    builder: { /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        type: Schema.Types.ObjectId,
        ref: 'Builder'
    },
    subdivision: {
        type: Schema.Types.ObjectId,
        ref: 'Division'
    },
    type: {
        type: String,
        enum: ["sale", "business", "rent", "development"],
        required: [true, 'The type of building is Required'],
    },
    businessType: {
        type: String,
        enum: ["house", "local", "terrain"],
        required: [true, 'The business type is Required'],
    },
    model: {
        type: Schema.Types.ObjectId,
        ref: 'BuildModel'
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
    description: {
        type: String,
    },
    constructionmts: {
        type: Number,
        required: [true, 'The construction mts is required'],
    },
    mtsland: {
        type: Number,
        required: [true, 'The mts land is Required'],
    },
    equipment: {
        type: String,
        required: [true, 'The equipment is Required'],
    },
    creditsAmount: {
        type: Number,
        required: [false, 'The Amount is Required'],
    },
    price: {
        type: Number
    },
    exchangeRate: {
        type: String,
        enum: ['USD', 'MXN'],
        required: [true, 'The exchange rate is Required'],
    },
    appraisal: {
        type: Number,
        required: [false, 'The appraisal is Required'],
    },
    discount: {
        type: Number,
    },
    commission: {
        type: Number,
        default: 0,
    },
    commissionType: {
        type: String,
        enum: ['percentage', 'currency'],
        default: 'percentage',
    },
    deliveryTime: {
        type: Number,
        required: [false, 'The delivery time is Required'],
    },
    credits: {
        type: [Schema.Types.ObjectId],
        ref: 'BankCredit',
        required: [true, 'The Credits is Required'],
    },
    street: {
        type: String,
        required: [true, 'The Street is Required'],
    },
    suburb: {
        type: String,
        required: [true, 'The Suburb is Required'],
    },
    number: {
        type: Number,
    },
    zipcode: {
        type: Number,
    },
    assessment: {
        type: String,
    },
    debts: {
        type: String,
    },
    catcher: {
        type: String,
    },
    owners: {
        type: String,
    },
    customers: {
        type: [Schema.Types.ObjectId],
        ref: 'Customer',
    },
    propertyState: {
        type: String,
        enum: ['selled', 'available', 'secluded'],
        default: 'available'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true,
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: 'Attachment'
    },
    attachments: [DocumentSchema],
    taxation: [GeneralSchema],
    repairs: {
        type: [GeneralSchema]
    },
    services: {
        type: [GeneralSchema]
    },
    soldBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    saleDate: {
        type: Date
    },
    registerDate: {
        type: Date,
        default: Date.now
    },
    idEmployee: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
    },
})

PropertiesSchema.methods.toJSON = function() {
    const {
        __v,
        ...propierty
    } = this.toObject()
    return propierty
}



module.exports = model('Property', PropertiesSchema)