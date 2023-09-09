const express = require('express');
const { checkSpaceAvailability } = require('../controllers/test.controller');

const router = express.Router();

router.post('/', checkSpaceAvailability);

module.exports = router;