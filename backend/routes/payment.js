const express = require('express');
const { startPayment, completePayment, getPayment } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/', startPayment)

router.get('/pay', completePayment)

router.get('/:ref', getPayment)



module.exports = router;