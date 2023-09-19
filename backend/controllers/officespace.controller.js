const OfficeSpace = require('../models/officespace.model');
const { createError } = require('../utils');

const createOfficeSpace = async (req,res,next) => {
  try {
    const newSpace = await OfficeSpace.create(req.body);
    res.status(201).json(newSpace);
  } catch (error) {
    next(error)
  }
}

const getAllOfficeSpace = async (req, res, next) => {
  const { type } = req.query;

  try {
    if (type) {
      const spaces = await OfficeSpace.find({ type }).sort({ createdAt: -1 }); 
      res.status(200).json(spaces);
    } else {
      const space = await OfficeSpace.find().sort({ createdAt: -1 });
      res.status(200).json(space);
    }
  } catch (error) {
    next(error);
  }
};

const getOfficeSpace = async (req,res,next)=>{
  const { id } = req.params
  try {
    if(id){
      const space = await OfficeSpace.findById(id);
      res.status(200).json(space);
    } else {
      createError(404, "Record was not found!")
    }
  } catch (err) {
    next(err);
  }
}

const deleteOfficeSpace = async (req,res,next)=>{
  const { id } = req.params
  try {
    if(id) {
      const space = await OfficeSpace.findByIdAndDelete(id);
      if(!space) createError(404, "Cannot perform delete operation")    
      res.status(200).json(space);
    } else {
      createError(404, "Record was not found!")
    }
  } catch (err) {
    next(err);
  }
}

const updateOfficeSpace = async (req,res,next)=>{
  const { id } = req.params
  try {
    if(id) {
      const space = await OfficeSpace.findByIdAndUpdate(id, {...req.body}, { new: true },);
      res.status(200).json(space);
    } else {
      createError(500, "Error retrieving space record")
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { 
                    createOfficeSpace,
                    getOfficeSpace, 
                    getAllOfficeSpace, 
                    deleteOfficeSpace, 
                    updateOfficeSpace 
                  }
