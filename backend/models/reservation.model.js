const mongoose = require('mongoose');
const OfficeSpace = require('../models/officespace.model');

const reservationSchema = new mongoose.Schema({
    space_id: {
        type: mongoose.Schema.ObjectId,
        ref: OfficeSpace,
        required: true
    }, 
    days: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
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
    }
},
{
    timestamps: true
})

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;

