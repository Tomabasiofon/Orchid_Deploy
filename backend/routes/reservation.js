const express = require('express');
const { createReservation, checkAvailability } = require('../controllers/reservation.controller');

const router = express.Router();

router.post('/check', checkAvailability);

router.post('/', createReservation);



module.exports = router;