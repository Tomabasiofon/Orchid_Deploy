const mongoose = require('mongoose');

const authSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    phonenumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'super_admin'],
        default: 'admin'
    }
}, {
    timestamps: true
})

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth