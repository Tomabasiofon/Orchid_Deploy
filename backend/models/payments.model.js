const mongoose = require('mongoose');
const Reservation = require('./reservation.model');
const People = require('./people.model');

const paymentSchema = new mongoose.Schema({
    reservation_ids: [{
        type: mongoose.Schema.ObjectId,
        ref: Reservation
    }],
    person_id: {
        type: mongoose.Schema.ObjectId,
        ref: People
    },
    tx_ref: {
        type: String,
        required: true
    },
    transaction_id: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
})


const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;


