const Reservation = require('../models/reservation.model');
const OfficeSpace = require('../models/officespace.model');
const Payment = require('../models/payments.model');
const People = require('../models/people.model');
const mongoose = require('mongoose');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { myNanoid, calculateTotalReservationAmount, sendEmailWithPDF, createError } = require('../utils');

const startPayment = async (req, res, next) => {
    const session = await mongoose.startSession();
    const { tx_ref, email , name , phonenumber, amount } = req.body

    try {
      await session.startTransaction();

        const { data } = await axios.post('https://api.flutterwave.com/v3/payments', {
                tx_ref,
                amount,
                currency: "NGN",
                redirect_url: "https://orchidspring2.onrender.com/api/payment",
                // meta: {
                //     reservation_ids,
                // },
                customer: {
                    email,
                    phonenumber,
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

const completePayment = async (req,res,next) => {
  const session = await mongoose.startSession();
  const { tx_ref, status, transaction_id } = req.query

  try {
    await session.startTransaction();

    if(status === "success") {
      const person = await People.findOne({ tx_ref }).populate('reservation_ids').exec();
  
      const reservations = person.reservation_ids.map(item => item);
  
      let updatedReservations
      if (reservations) {
        updatedReservations = await Promise.all(
          reservations.map(async (item) => {
            const reservation = await Reservation.findByIdAndUpdate(item._id, { status: 'completed'})
            return reservation;
          }))
        };
  
          const amount = calculateTotalReservationAmount(reservations);
          const reservation_ids = reservations.map(item => item._id);
  
          if(transaction_id) {

            const newPayment = await Payment.create({
              reservation_ids,
              person_id: person._id,
              tx_ref,
              status: 'completed',
              amount,
              transaction_id
            })
            } else {
              const newPayment = await Payment.create({
                reservation_ids,
                person_id: person._id,
                tx_ref,
                status: 'completed',
                amount,
              })
            }
          
        await sendEmailWithPDF((person.firstname + ' ' + person.lastname), person.email, amount, tx_ref )

        res.redirect(`https://orchidspring2.onrender.com/confirmation?status=${status}&tx_ref=${tx_ref}`)
    } else {
      res.redirect(`https://orchidspring2.onrender.com/confirmation?status=${status}&tx_ref=${tx_ref}`)
    }
    // If everything is successful, commit the transaction
    await session.commitTransaction();
  }catch (error) {
    await session.abortTransaction();

    next(error);
  } finally {
    session.endSession();
  }
}

const getPayment = async(req, res, next) => {
  const tx_ref = req.params.ref
  try {
    const payment = await Payment.findOne({ tx_ref }).populate('person_id').exec()
    res.status(200).json(payment)
  } catch (error) {
    next(error)
  }
}


module.exports = { startPayment, completePayment, getPayment }