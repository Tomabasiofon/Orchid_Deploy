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
        type: [Date],
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
        type: String, 
    },
    discountPercentage: {
        type: Number,
    }
}, {
    timestamps: true
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
