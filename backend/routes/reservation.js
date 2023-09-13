const express = require('express');
const { createReservation, checkReservationAvailability, getReservation, getCompletedReservation, costReservation } = require('../controllers/reservation.controller');

const router = express.Router();

router.post('/', createReservation);

router.get('/', getCompletedReservation)

router.post('/check', checkReservationAvailability);

router.post('/cost', costReservation)

router.get('/:id', getReservation);



module.exports = router;