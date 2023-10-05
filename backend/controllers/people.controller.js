const People = require('../models/people.model');
const { createError } = require('../utils');

const getPeople = async (req, res, next) => {
  try {
    const id = req.params.id

    if(id){
      const person = await People.findById(id);
      res.status(200).json(person);
    } else {
      const persons = await People.find();
      res.status(200).json(persons);
    }
  } catch (error) {
      next(error)
  }
}

const getPersonByReservationId = async (req,res,next) => {
  const id = req.params.res_id
  try {
    if(id) {
      const person = await People.findOne({ reservation_id: id });
      res.status(200).json(person);
    } else {
      createError(404, "Person Details not found");
    }
  } catch (error) {
    next(error)
  }
}

const updatePerson = async (req,res,next) => {
  const { id } = req.params
  try {
    if(id) {
      const person = await People.findByIdAndUpdate(id, {...req.body}, { new: true },);
      res.status(200).json(person);
    } else {
      createError(500, "Error retrieving space record")
    }
  } catch (error) {
    next(error)
  }
}

module.exports = { getPeople, getPersonByReservationId, updatePerson }