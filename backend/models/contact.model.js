const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        lowercase: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        uniquie: true,
    },
    phonenumber: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true
    },
    message: [{
        type: String,
    }]
}, {
    timestamps: true
})

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact