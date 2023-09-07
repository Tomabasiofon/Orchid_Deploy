const express = require('express');
const { getPeople, createPerson, getPersonByReservationId } = require('../controllers/people.controller');

const router = express.Router();

router.post('/', createPerson);

router.get('/', getPeople);

router.get('/reservation/:res_id', getPersonByReservationId);

router.get('/:id', getPeople);

module.exports = router;