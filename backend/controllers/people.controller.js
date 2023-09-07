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

const createPerson = async (req,res,next)=>{
  try {
    const person = await People.create(req.body);
    res.status(200).json(person);
  } catch (err) {
    next(err);
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

module.exports = { createPerson, getPeople, getPersonByReservationId }