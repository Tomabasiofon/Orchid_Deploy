const express = require('express');

const router = express.Router();

router.get('/', (req,res,next) => {
    res.status(200).json({ body: req.body, query: req.query})
})



module.exports = router;