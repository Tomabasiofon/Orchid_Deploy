const People = require('../models/people.model');
const Reservation = require('../models/reservation.model');
const axios = require('axios');
const { createError } = require('../utils');
const { createReservation } = require('./reservation.controller');

const getPeople = async (req, res, next) => {
    try {
        const id = req.params.id

        if(id){
          const person = await People.findById(id);
          res.status(200).json(person);
        } else {
          const persons = await People.find();
          res.status(200).json(persons);
        }
    } catch (error) {
        next(error)
    }
}

// Function to create a user record with reservation IDs
// async function createUserWithReservations(userData) {
//   try {
//     const reservationIds = await getReservationsForUser(userData); // Replace with your function to get reservations

//     const newUser = new People({
//       title: userData.title,
//       firstname: userData.firstname,
//       lastname: userData.lastname,
//       gender: userData.gender,
//       email: userData.email,
//       country: userData.country,
//       address: userData.address,
//       phoneNumber: userData.phoneNumber,
//       reservation_ids: reservationIds, // Assign the array of reservation IDs
//     });

//     // Save the new user to the database
//     const savedUser = await newUser.save();
//     return savedUser;
//   } catch (error) {
//     // Handle any errors here
//     console.error('Error creating user:', error);
//     throw error;
//   }
// }

// // Call the function to create a user with reservation IDs
// createUserWithReservations(userData)
//   .then((user) => {
//     console.log('User created with reservations:', user);
//   })
//   .catch((error) => {
//     console.error('Error creating user with reservations:', error);
//   });


const createPerson = async (req,res,next)=>{
  try {
    const reservations = await axios.post('https://orchidspring2.onrender.com/api/reservation', req.body);
    // const reservationIds = reservations.map(item => {
    //   return item._id
    // })
    
    res.status(200).send(reservations);
  } catch (error) {
    next(error);
  }
  // try {
  //   const person = await People.create(req.body);
  //   res.status(200).json(person);
  // } catch (err) {
  //   next(err);
  // }
}

const getPersonByReservationId = async (req,res,next) => {
  const id = req.params.res_id
  try {
    if(id) {
      const person = await People.findOne({ reservation_id: id });
      res.status(200).json(person);
    } else {
      createError(404, "Person Details not found");
    }
  } catch (error) {
    next(error)
  }
}

module.exports = { createPerson, getPeople, getPersonByReservationId }