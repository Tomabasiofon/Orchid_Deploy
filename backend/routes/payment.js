const express = require('express');
const { startPayment, completePayment, getPayment, allPayments } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/', startPayment)

router.get('/all', allPayments)

router.get('/pay', completePayment)

router.get('/:ref', getPayment)



module.exports = router;