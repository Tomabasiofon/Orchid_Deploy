const express = require('express');
const { createReservation, checkAvailability, getReservation, startReservation, completeReservation } = require('../controllers/reservation.controller');

const router = express.Router();

router.post('/check', checkAvailability);

router.get('/complete', completeReservation)

router.post('/start/:id', startReservation);

router.post('/', createReservation);

router.get('/:id', getReservation);



module.exports = router;