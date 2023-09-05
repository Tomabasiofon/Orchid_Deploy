const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieparser = require('cookie-parser');
const { connectDB } = require('./config/db');
const { handleErrorsMiddleware } = require('./middleware/errorHandler');
const dotenv = require('dotenv').config();
const bodyparser = require('body-parser');

const officeSpaceRoutes = require('./routes/officespace');
const reservationRoutes = require('./routes/reservation');
const peopleRoutes = require('./routes/people');
const homeRoutes = require('./routes/home');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(bodyparser.urlencoded({ extended: true}));

app.set('view engine', 'ejs');
app.set('views', 'frontend');
// app.set('views', path.join(__dirname, 'frontend'));

app.use('/api/space', officeSpaceRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/people', peopleRoutes);
// app.post
app.post('/api/test', (req,res) => {
    // res.status(200).json(req.body)
    console.log(req.body.spaceid)
    res.render('booking')
})

//Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req,res) => {
    res.render('index');
})
app.get('/booking', (req,res) => {
    console.log(req.body)
    res.render('booking')
})
app.get('/booking-details', (req,res) => {
    res.render('booking-details')
})
app.get('/confirmation', (req,res) => {
    res.render('confirmation')
})
app.get('/list', (req,res) => {
    res.render('booking-list')
})

app.get('*', (req,res) => {
    res.render('404')
})


// app.get('*', (req,res) => {
//     res.sendFile(path.resolve(__dirname, '../', 'frontend', 'index.html'))
// })


// Handle Errors
app.use(handleErrorsMiddleware);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    connectDB()
})