const Reservation = require('../models/reservation.model');
const mongoose = require('mongoose');
const { calculateDays } = require('../utils');

// Controller function to check if a date range is available for a space
const checkAvailability = async (req, res) => {
    try {
        const { space_id, start_date, end_date } = req.body;

        // Query the database to find overlapping reservations for the same space
        const overlappingReservations = await Reservation.find({
            space_id: space_id,
            $or: [
                {
                    // Case 1: Existing reservation starts during the new reservation
                    start_date: { $gte: start_date, $lte: end_date },
                },
                {
                    // Case 2: Existing reservation ends during the new reservation
                    end_date: { $gte: start_date, $lte: end_date },
                },
                {
                    // Case 3: Existing reservation completely covers the new reservation
                    start_date: { $lte: start_date },
                    end_date: { $gte: end_date },
                },
            ],
        }).select('space_id start_date end_date'); // Select only the required fields

        // If there are overlapping reservations, the date range is not available
        if (overlappingReservations.length > 0) {
            return res.status(200).json({ available: false, overlappingReservations });
        }

        // If there are no overlapping reservations, the date range is available
        return res.status(200).json({ available: true });

    } catch (error) {
        console.error('Error checking availability:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// const checkAvailability = async (req, res) => {
//     try {
//         const { space_id, start_date, end_date } = req.body;

//         const overlappingReservations = await Reservation.find({
//             space_id: space_id,
//             $or: [
//                 {
//                     // Case 1: Existing reservation starts during the new reservation
//                     start_date: { $gte: start_date, $lte: end_date },
//                 },
//                 {
//                     // Case 2: Existing reservation ends during the new reservation
//                     end_date: { $gte: start_date, $lte: end_date },
//                 },
//                 {
//                     // Case 3: Existing reservation completely covers the new reservation
//                     start_date: { $lte: start_date },
//                     end_date: { $gte: end_date },
//                 },
//             ],
//         });

//         if(overlappingReservations.length > 0) {
//             res.redirect(`/booking?available=false`)
//             // res.render('booking', {
//             //     available: false
//             // })
//         } else {
//             res.redirect(`/booking?available=true`)
//             // res.render('booking', {
//             //     available: true
//             // })
//         }

//     } catch (error) {
//         console.error('Error checking availability:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };

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


module.exports = { createReservation, completeReservation, checkAvailability }