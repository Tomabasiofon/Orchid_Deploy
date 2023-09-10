const mongoose = require('mongoose');
const OfficeSpace = require('../models/officespace.model');
const Promos = require('../models/promo.model');

const reservationSchema = new mongoose.Schema({
    space_id: {
        type: mongoose.Schema.ObjectId,
        ref: OfficeSpace,
        required: true
    },
    dates: {
        type: [Date], // Use an array to store a list of dates
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    price: {
        type: Number,
        required: true
    },
    promoCode: {
        type: mongoose.Schema.ObjectId,
        ref: Promos, 
    },
    discountPercentage: {
        type: Number,
    }
}, {
    timestamps: true
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
