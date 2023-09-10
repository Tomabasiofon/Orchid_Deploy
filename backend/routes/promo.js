const express = require('express');
const router = express.Router();
const { createPromo, getPromos} = require('../controllers/promo.controller');


router.post('/', createPromo);

router.get('/', getPromos);
router.get('/:code', getPromos);

module.exports = router