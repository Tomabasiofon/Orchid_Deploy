const express = require('express');
const { checkReservation, createReservation } = require('../controllers/reservation.controller');

const router = express.Router();

// router.get('/', checkReservation);

router.post('/', createReservation);



module.exports = router;