const express = require('express');
const { getPeople, createPerson } = require('../controllers/people.controller');

const router = express.Router();

router.post('/', createPerson);

router.get('/', getPeople);

router.get('/:id', getPeople);

module.exports = router;