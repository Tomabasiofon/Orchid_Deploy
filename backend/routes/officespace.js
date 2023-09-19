const express = require('express');
const { verifyAdmin } = require('../middleware/authHandler');
const { getAllOfficeSpace, getOfficeSpace, createOfficeSpace, updateOfficeSpace, deleteOfficeSpace } = require('../controllers/officespace.controller');

const router = express.Router();

router.post("/", createOfficeSpace);

router.get("/", getAllOfficeSpace);

router.get("/:id", getOfficeSpace);

// Update
router.patch('/:id', updateOfficeSpace);

// Delete
router.delete('/:id', deleteOfficeSpace);


module.exports = router;