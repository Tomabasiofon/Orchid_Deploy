const express = require('express');
const { getPeople, getPersonByReservationId, updatePerson } = require('../controllers/people.controller');

const router = express.Router();

router.get('/', getPeople);

router.get('/reservation/:res_id', getPersonByReservationId);

router.get('/:id', getPeople);

router.patch('/:id', updatePerson);

module.exports = router;