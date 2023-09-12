const express = require('express');
const { createReservation, checkReservationAvailability, getReservation, startReservation, completeReservation, getCompletedReservation, costReservation } = require('../controllers/reservation.controller');

const router = express.Router();

router.post('/', createReservation);

router.get('/', getCompletedReservation)

router.post('/check', checkReservationAvailability);

router.post('/cost', costReservation)

router.get('/:id', getReservation);

router.get('/complete', completeReservation)

router.post('/start/:id', startReservation);



module.exports = router;