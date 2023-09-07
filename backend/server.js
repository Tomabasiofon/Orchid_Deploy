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
const paymentRoutes = require('./routes/payment');
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

app.use('/api/space', officeSpaceRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/payment', paymentRoutes);
app.post('/api/test', (req,res) => {
    // res.status(200).json(req.body)
    console.log(req.body)
    res.status(200).json(req.body)
    // res.render('booking')
})

//Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api',(req,res) => {
    const title = "API"
    res.render('welcome',{ title });
})

app.get('/', (req,res) => {
    const title = "Home"
    res.render('index',{ title });
})
app.get('/booking', async (req,res) => {
    const title = "Booking"
    const deskspaces = await axios.get('http://localhost:8080/api/space?type=space');
    const roomspaces = await axios.get('http://localhost:8080/api/space?type=room');
    if(deskspaces){
        res.render('booking',{ title, deskspaces: deskspaces.data, roomspaces: roomspaces.data })
    } else {
        res.render('error',{ title: 'Bad request'})
    }
})
app.get('/booking-details', async(req,res) => {

    const reservation = await axios.post('http://localhost:8080/api/reservation', req.query)
    if(reservation) {
        const title = "Booking Details"
        res.render('booking-details',{ title, reservation: reservation.data })
    } else {
        res.render('error',{ title: 'Bad request'})
    }
})
app.get('/payment', async(req,res) => {
    const id = req.query.id;
    try {
        if (id) {
            const reservation = await axios.get(`http://localhost:8080/api/reservation/${id}`)
            const person = await axios.get(`http://localhost:8080/api/people/reservation/${id}`)
            const title = "Payment"
            res.render('pay', { title, reservation: reservation.data, person: person.data });
        }
    } catch (error) {   
        res.render('error',{ title: 'Bad request'})
    }
})
app.get('/confirmation', async (req,res) => {
    const { id, success } = req.query;
    try {
        if(id && success) {
            const reservation = await axios.get(`http://localhost:8080/api/reservation/${id}`)
            const title = "Confirmation"
            res.render('confirmation',{ title, reservation: reservation.data, success })
        }else if(id) {
            const reservation = await axios.get(`http://localhost:8080/api/reservation/${id}`)
            const title = "Confirmation"
            res.render('confirmation',{ title, reservation: reservation.data, success: null })
        }

    } catch (error) {
        res.render('error',{ title: 'Bad request'})
    }
})
app.get('/list', (req,res) => {
    const title = "Booking"
    res.render('booking-list',{ title })
})
app.get('/contact', (req,res)=> {
    const title = "Contact"
    res.render('contact',{ title })
})
app.get('/about', (req,res) => {
    const title = "About"
    res.render('about',{ title })
})
app.get('/promo', async(req,res) => {
    const title = "Promo"
    res.render('promo',{ title })
})

app.get('*', (req,res) => {
    const title = "404"
    res.render('404',{ title })
})


// Handle Errors
app.use(handleErrorsMiddleware);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    connectDB()
})