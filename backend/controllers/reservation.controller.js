const Reservation = require('../models/reservation.model');
const OfficeSpace = require('../models/officespace.model');
const Payment = require('../models/payments.model');
const mongoose = require('mongoose');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { calculateDays, createError } = require('../utils');

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
        }) // Select only the required fields


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

const createReservation = async (req, res, next) => {
    try {
        // Get the selected space IDs from the request
        const { space_id, start_date, end_date } = req.body;

        const existingReservation = await Reservation.findOne({
            space_id: { $in: space_id },
            start_date,
            end_date,
        });

        if (existingReservation) {
            createError(400, 'Reservation already exists for selected space and dates')
        }

        const days = calculateDays(start_date, end_date);
        const selectedSpaces = await OfficeSpace.find({ _id: { $in: space_id } });

        let totalPrice = 0;
        for (const space of selectedSpaces) {
            totalPrice += space.price * days;
        }

        const reservationData = {
            space_id,
            start_date,
            end_date,
            status: 'pending',
            days,
            price: totalPrice, // Set the total price
        };

        const reservation = await Reservation.create(reservationData);

        res.status(201).json(reservation);
    } catch (error) {
        next(error);
    }
};

const getReservation = async (req,res,next) => {
    const { id } = req.params
    try {
        if(id){
            const reservation = await Reservation.findById(id);
            res.status(200).json(reservation);
        } else {
            createError(404, "Record was not found!")
        }
    } catch (err) {
        next(err);
    }

}

const getCompletedReservation = async (req,res,next) => {
    try {
        const reservations = await Reservation.find({ status: 'completed' })
        res.status(200).json(reservations);
    } catch (error) {
        next(error)
    }
}


const startReservation = async (req, res, next) => {
    const session = await mongoose.startSession();
    const { reservation_id, name, email, phoneNumber } = req.body

    try {
      await session.startTransaction();
  
      // Perform operations within the transaction
      const reservation = await Reservation.findById(reservation_id);

      if(!reservation) createError(404, 'No reservations found');
      const uid = uuidv4()

        const { data } = await axios.post('https://api.flutterwave.com/v3/payments', {
            tx_ref: uid,
                amount: reservation.price,
                currency: "NGN",
                redirect_url: "https://orchidspring2.onrender.com/api/reservation/complete",
                // meta: {
                //     consumer_id: 23,
                //     consumer_mac: "92a3-912ba-1192a"
                // },
                customer: {
                    email,
                    phonenumber: phoneNumber,
                    name
                },
                customizations: {
                    title: "Orchidsprings",
                }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
            }
        })

        const paymentData = {
            tx_ref: uid,
            status: reservation.status,
            reservation_id,
            amount: reservation.price
        }
        const newPayment = await Payment.create(paymentData)

        if(!newPayment) createError(400, "Payment Initiation failed")


  
      // If everything is successful, commit the transaction
      await session.commitTransaction();
  
      res.redirect(data.data.link)
    } catch (error) {
      await session.abortTransaction();
  
      next(error);
    } finally {
      session.endSession();
    }
};


const completeReservation = async (req, res, next) => {
    // res.status(200).json({ body: req.body, query: req.query})
    const session = await mongoose.startSession();
    const { status, tx_ref, transaction_id } = req.query

    try {
      await session.startTransaction();
  
      // Perform operations within the transaction
      if(status == 'failed') createError(400,'Payment failed') 
        const payment = await Payment.findOne({ tx_ref });
        const reservation = await Reservation.findById(payment.reservation_id);

        if(!payment) createError(400,'Payment failed') 
        const completedPayment = await Payment.findOneAndUpdate({_id: payment._id}, { status: 'completed', transaction_id }, { new: true })
        if(!reservation) createError(400,'Payment failed') 
        const completedReservation = await Reservation.findOneAndUpdate({ _id: reservation._id }, { status: 'completed'}, {new: true})

        const customResponse = {
            ticket_id: completedReservation._id,
            transaction_id,
            amount: completedPayment.amount
        }


  
      // If everything is successful, commit the transaction
      await session.commitTransaction();
      res.redirect(`https://orchidspring2.onrender.com/confirmation?id=${completedReservation._id}&success=${status}`)
  
    } catch (error) {
      await session.abortTransaction();
  
      next(error);
    } finally {
      session.endSession();
    }
};



module.exports = { createReservation, startReservation, checkAvailability, getReservation, completeReservation, getCompletedReservation }