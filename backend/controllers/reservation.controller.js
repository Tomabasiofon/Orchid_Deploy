const Reservation = require('../models/reservation.model');
const mongoose = require('mongoose');
const { calculateDays } = require('../utils');

const createReservation = async (req,res, next) => {
    try {
        req.body.status = 'pending';
        req.body.days = calculateDays(req.body.start_date, req.body.end_date)
        const reservation = await Reservation.create(req.body);
        res.status(201).json(reservation)
    } catch (error) {
        next(error);
    }
}

const completeReservation = async (req,res,next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        await session.withTransaction(async () => {
            // Perform operations within the transaction
            
        });

        await session.commitTransaction();
        res.status(200).json();
    } catch (error) {
        await session.abortTransaction();
        next(error)
    }
    session.endSession();
}


module.exports = { createReservation, completeReservation }