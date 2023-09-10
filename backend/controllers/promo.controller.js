const Promos = require('../models/promo.model');
const { createError } = require('../utils');

const createPromo = async (req,res,next) => {
    try {
        const newPromo = await Promos.create(req.body);
        res.status(201).json(newPromo);

    } catch (error) {
        next(error)
    }
}

const getPromos = async (req,res,next) => {
    try {
        const code = req.params.code
        if(code) {
            const promo = await Promos.findOne({ code })
            res.status(200).json(promo)
        } else {
            const promo = await Promos.find();
            res.status(200).json(promo)
        }
    } catch (error) {
        next(error)
    }
}

module.exports = { createPromo, getPromos }