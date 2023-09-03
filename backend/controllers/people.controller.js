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

module.exports = { createPerson, getPeople }