const Reservation = require('../models/reservation.model');
const OfficeSpace = require('../models/officespace.model');
const Payment = require('../models/payments.model');
const People = require('../models/people.model');
const mongoose = require('mongoose');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { calculateDays, createError, calculateDaysWithDatesArray } = require('../utils');


const checkSpaceAvailability = async (req, res) => {
    const { space_id, start_date, end_date } = req.body;
    const dates = calculateDaysWithDatesArray(start_date, end_date);

    try {
        const space = await OfficeSpace.findById(space_id);
        if (!space) createError(404, 'Space not found');

        const overlappingReservations = await Reservation.find({
            space_id: space_id,
            dates: {
                $elemMatch: { $in: dates }
            },
            status: 'pending',
        });

        if (overlappingReservations.length === 0) {
            // No overlapping reservations found for the space and date range
            return res.json({ available: true, overlappingReservations: [] });
        } else {
            // Overlapping reservations found for the space and date range
            return res.json({ available: false, overlappingReservations });
        }
    } catch (error) {
        next(error)
    }
};

const createReservation = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();

        const { start_date, end_date } = req.body;
        let { space_id } = req.body;
        const dates = calculateDaysWithDatesArray(start_date, end_date);

        if (!Array.isArray(space_id)) {
            space_id = [space_id];
        }

        const existingReservations = await Reservation.find({
            space_id: { $in: space_id },
            dates: { $in: dates },
            status: 'pending'
        });

        if (existingReservations.length > 0) {
            createError(400, 'Reservation already exists for selected space and dates');
        }

        const selectedSpaces = await OfficeSpace.find({ _id: { $in: space_id } });

        if (selectedSpaces.length !== space_id.length) {
            createError(404, 'One or more spaces not found');
        }

        const days = dates.length;
        const reservationsToCreate = [];

        for (const space of selectedSpaces) {
            const totalPrice = space.price * days;

            const reservationData = {
                space_id: space._id,
                dates,
                status: 'pending',
                price: totalPrice,
            };

            reservationsToCreate.push(reservationData);
        }

        const createdReservations = await Reservation.create(reservationsToCreate);
        const createdReservationsIds = createdReservations.map(item => item._id);

        const createdPersons = await People.create({
            ...req.body,
            reservation_ids: createdReservationsIds
        })

        await session.commitTransaction();

        res.status(201).json({ person: createdPersons , reservations: createdReservations});
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
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
    } catch (error) {
        next(error);
    }
}

const getCompletedReservation = async (req,res,next) => {
    try {
        const reservations = await Reservation.find({status: 'completed'})
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
      if(status == 'failed' || status == 'cancelled') createError(400,'Payment failed') 
        const payment = await Payment.findOne({ tx_ref });
        const reservation = await Reservation.findById(payment.reservation_id);

        if(!payment) createError(400,'Payment failed') 
        if(!reservation) createError(400,'Payment failed') 
        if(payment.amount != reservation.price) createError(400,'Payment failed') 

        const completedPayment = await Payment.findOneAndUpdate({_id: payment._id}, { status: 'completed', transaction_id }, { new: true })
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



module.exports = { createReservation, startReservation, checkSpaceAvailability, getReservation, completeReservation, getCompletedReservation }