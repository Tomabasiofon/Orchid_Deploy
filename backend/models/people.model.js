const mongoose = require('mongoose');
const Reservation = require('./reservation.model');

const peopleSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    country: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
    },
    tx_ref: {
        type: String,
        unique: true,
        required: true
    },
    reservation_ids: [{
        type: mongoose.Schema.ObjectId,
        ref: Reservation
    }]
}, {
    timestamps: true
})

const People = mongoose.model('People', peopleSchema);
module.exports = People;
