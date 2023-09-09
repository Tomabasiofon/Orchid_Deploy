const express = require('express');
const { startPayment } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/', startPayment)



module.exports = router;