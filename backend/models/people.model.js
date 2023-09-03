const mongoose = require('mongoose');
const Reservation = require('./reservation.model');
const validator = require('validator');

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
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is not valid");
            }
        }
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
    reservation_id: {
        type: mongoose.Schema.ObjectId,
        ref: Reservation
    }
}, {
    timestamps: true
})

const People = mongoose.model('People', peopleSchema);
module.exports = People;