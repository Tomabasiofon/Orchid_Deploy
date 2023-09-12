const Reservation = require('../models/reservation.model');
const OfficeSpace = require('../models/officespace.model');
const Payment = require('../models/payments.model');
const People = require('../models/people.model');
const mongoose = require('mongoose');
const Promos = require('../models/promo.model');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { calculateDays, createError, calculateDaysWithDatesArray, myNanoid, groupBySpaceId, calculateTotalReservationAmount } = require('../utils');

const checkReservationAvailability = async (req, res, next) => {
  try {
    const { space_id, current_date } = req.body; 

    const conflictingReservation = await Reservation.findOne({
      $and: [
        { space_id },
        {
          dates: {
            $in: [new Date(current_date)], 
          },
        },
        { status: 'completed' },
      ],
    });

    if (!conflictingReservation) {
      res.status(200).json({ available: true });
    } else {
      res.status(200).json({ available: false });
    }
  } catch (error) {
    next(error)
  }
};

const createReservation = async (req, res, next) => {
    const session = await mongoose.startSession();
    const { formData, promoCode } = req.body
    try {
        await session.startTransaction();

        if(!formData) res.status(200).json({});

        
        const spaces = groupBySpaceId(formData)

        const existingReservations = await Reservation.find({
            $or: spaces.map(({space_id, dates}) => ({
              space_id,
              dates: {
                $elemMatch: { $in: dates },
              },
              status: 'completed',
            })),
          });

        if (existingReservations.length > 0) {
            createError(400, 'Reservation already exists for selected space and dates');
        }

        const spaceIds = spaces.map((item) => item.space_id); 
        const selectedSpaces = await OfficeSpace.find({ _id: { $in: spaceIds } });

        // console.log({spaceIds, selectedSpaces})

        if (selectedSpaces.length !== spaceIds.length) createError(404, 'One or more spaces not found');

        let discountPercentage = 0; 
        if (promoCode) {
          const promo = await Promos.findOne({ code: promoCode });
          if (promo) {
            discountPercentage = promo.discountPercentage;
          } else {
            createError(400, 'Invalid promo code');
          }
        }

        const reservationsToCreate = [];

        spaces.forEach((space) => {
            const matchingSpace = selectedSpaces.find((selectedSpace) => {
                return space.space_id.toString() === selectedSpace._id.toString();
            });

            if (matchingSpace) {
                const data = {
                    space_id: space.space_id,
                    dates: space.dates,
                    status: 'pending',
                    price: space.dates.length * matchingSpace.price * ((100 - discountPercentage) / 100 || 1),
                    discountPercentage,
                    promoCode: promoCode || null
                };
                reservationsToCreate.push(data);
            }
        });

        const createdReservations = await Reservation.create(reservationsToCreate);

        res.status(200).json(createdReservations);

        await session.commitTransaction();
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
        const reservations = await Reservation.find({status: 'completed'}).populate('space_id').exec()
        res.status(200).json(reservations);
    } catch (error) {
        next(error)
    }
}

const costReservation = async (req, res, next) => {
  let { reservation_id } = req.body;
  const reservation_ids = reservation_id
  
  try {
    const nanoid = await myNanoid();
    const uid = nanoid.nanoid(7);
    const newPerson = await People.create({
      ...req.body,
      tx_ref: uid,
      reservation_ids
    });

    // Check if reservation_id is defined and not an array, then convert it
    if (reservation_id !== undefined && !Array.isArray(reservation_id)) {
      reservation_id = [reservation_id];
    }

    if (reservation_id && reservation_id.length > 0) {
      const reservations = await Promise.all(
        reservation_id.map(async (id) => {
          const reservation = await Reservation.findById(id).populate('space_id').exec();
          return reservation;
        })
      );

      const total = calculateTotalReservationAmount(reservations);

      const details = reservations.map((reservation) => {
        return {
          seatNumber: reservation.space_id.seat_number,
          seatType: reservation.space_id.type,
          dates: reservation.dates,
          status: reservation.status
        };
      });

      const structuredResponse = {
        name: newPerson.firstname + ' ' + newPerson.lastname,
        email: newPerson.email,
        phonenumber: newPerson.phoneNumber,
        tx_ref: newPerson.tx_ref,
        details,
        total
      };

      res.status(200).json(structuredResponse);
    } else {
      createError(404, "No IDs provided for reservation lookup!");
    }
  } catch (error) {
    next(error);
  }
};


// const costReservation = async(req,res,next) => {
//   let { reservation_id } = req.body;
//   try {
//     const nanoid = await myNanoid();
//     const uid = nanoid.nanoid(7);
//     const newPerson = await People.create({
//       ...req.body,
//       tx_ref: uid
//     });

//     // Convert to an array if not an array
//     if(!Array.isArray(reservation_id)) {
//       reservation_id = Array.from(reservation_id)
//     }


//     if (reservation_id) {
//       const reservations = await Promise.all(
//         reservation_id.map(async (id) => {
//           const reservation = await Reservation.findById(id).populate('space_id').exec();
//           return reservation;
//         })
//       );

//     const total = calculateTotalReservationAmount(reservations);

//     const details = reservations.map(reservation => {
//       return {
//         seatNumber: reservation.space_id.seat_number,
//         seatType: reservation.space_id.type,
//         dates: reservation.dates,
//         status: reservation.status
//       }
//     })

//     const structuredResponse = {
//       name: newPerson.firstname + ' ' + newPerson.lastname,
//       email: newPerson.email,
//       phonenumber: newPerson.phoneNumber,
//       tx_ref: newPerson.tx_ref,
//       details,
//       total
//     }
      
//       res.status(200).json(structuredResponse);
//     } else {
//       createError(404, "No IDs provided for reservation lookup!");
//     }
//   } catch (error) {
//     next(error)
//   }
// }





































const getArrReservations = async (req, res, next) => {
  const { ids } = req.params;

  try {
    if (ids) {
      // Split the comma-separated IDs into an array
      const idArray = ids.split(',');

      // Find reservations for each ID and store them in an array
      const reservations = await Promise.all(
        idArray.map(async (id) => {
          const reservation = await Reservation.findById(id);
          return reservation;
        })
      );

      res.status(200).json(reservations);
    } else {
      createError(404, "No IDs provided for reservation lookup!");
    }
  } catch (error) {
    next(error);
  }
};

const startReservation = async (req, res, next) => {
    const session = await mongoose.startSession();
    const { reservation_id, name, email, phoneNumber } = req.body

    try {
      await session.startTransaction();
  
      // Perform operations within the transaction
      const reservation = await Reservation.findById(reservation_id);

      if(!reservation) createError(404, 'No reservations found');

      const nanoid = await myNanoid();
      const uid = nanoid.nanoid(7);

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



module.exports = { createReservation, startReservation, getReservation, completeReservation, getCompletedReservation, checkReservationAvailability, costReservation }