const Reservation = require('../models/reservation.model');
const OfficeSpace = require('../models/officespace.model');
const Payment = require('../models/payments.model');
const People = require('../models/people.model');
const mongoose = require('mongoose');
const Promos = require('../models/promo.model');
const axios = require('axios');
const { createError, myNanoid, groupBySpaceId, calculateTotalReservationAmount } = require('../utils');

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
        const reservations = await Reservation.find({status: 'completed'}).populate('space_id').sort({ createdAt: -1 }).exec()
        res.status(200).json(reservations);
    } catch (error) {
        next(error)
    }
}

const getReservees = async (req,res,next) => {
  try {
    const reservations = await Reservation.find({status: 'completed'}).populate('space_id').sort({ createdAt: -1 }).exec()
    const updatedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        const person = await People.findOne({ reservation_ids: {
          $in: [reservation._id]
        }})
        return {
          _id: reservation._id,
          name: person.firstname + " " + person.lastname,
          email: person.email,
          seat_number: reservation.space_id.seat_number,
          type: reservation.space_id.type,
          dates: reservation.dates,
          price: reservation.price,
          status: reservation.status,
          promoCode: reservation.promoCode,
          discountPercentage: reservation.discountPercentage,
          createdAt: reservation.createdAt
        };
      }))

    res.status(200).json(updatedReservations);
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



module.exports = { createReservation, getReservation, getCompletedReservation, checkReservationAvailability, costReservation, getReservees }