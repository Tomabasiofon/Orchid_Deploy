const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        lowercase: true
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    message: [{
        type: String,
    }]
}, {
    timestamps: true
})

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact