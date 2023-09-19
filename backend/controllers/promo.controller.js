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
const deletePromo = async (req,res,next)=>{
    const { code } = req.params
    try {
      if(code) {
        const promo = await Promos.findOneAndDelete({code});
        if(!promo) createError(404, "Cannot perform delete operation")    
        res.status(200).json(promo);
      } else {
        createError(404, "Record was not found!")
      }
    } catch (err) {
      next(err);
    }
  }
  
  const updatePromo = async (req,res,next)=>{
    const { code } = req.params
    try {
      if(code) {
        const promo = await Promos.findOneAndUpdate({ code }, {...req.body}, { new: true })
        res.status(200).json(promo);
      } else {
        createError(500, "Error retrieving space record")
      }
    } catch (err) {
      next(err);
    }
  }
module.exports = { createPromo, getPromos, updatePromo, deletePromo }