const express = require('express');
const { getContacts, sendContactDetails } = require('../controllers/contact.controller');

const router = express.Router();

// handle all contact us details
// @post
router.post('/', sendContactDetails);

// get all contact
// @get
router.get('/', getContacts);

module.exports = router;