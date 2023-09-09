const Reservation = require('../models/reservation.model');
const OfficeSpace = require('../models/officespace.model');
const Payment = require('../models/payments.model');
const People = require('../models/people.model');
const mongoose = require('mongoose');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const startPayment = async (req, res, next) => {
    const session = await mongoose.startSession();
    const { reservation_ids, email, phonenumber, amount, name } = req.body

    try {
      await session.startTransaction();
  
      const uid = uuidv4()

        const { data } = await axios.post('https://api.flutterwave.com/v3/payments', {
                tx_ref: uid,
                amount,
                currency: "NGN",
                redirect_url: "https://orchidspring2.onrender.com/",
                meta: {
                    reservation_ids,
                },
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


module.exports = { startPayment }