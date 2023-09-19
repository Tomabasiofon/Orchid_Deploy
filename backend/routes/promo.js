const express = require('express');
const router = express.Router();
const { createPromo, getPromos, updatePromo, deletePromo} = require('../controllers/promo.controller');


router.post('/', createPromo);

router.get('/', getPromos);
router.get('/:code', getPromos);
router.patch('/:code', updatePromo);
router.delete('/:code', deletePromo);

module.exports = router