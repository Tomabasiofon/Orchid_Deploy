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

// Create a virtual property to calculate the number of days
reservationSchema.virtual('calculateDays').get(function() {
    // Calculate the difference in milliseconds between end_date and start_date
    const timeDiff = this.end_date.getTime() - this.start_date.getTime();

    // Calculate the number of days by dividing milliseconds by the number of milliseconds in a day
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return days;
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;

