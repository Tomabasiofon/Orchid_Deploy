const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieparser = require('cookie-parser');
const { connectDB } = require('./config/db');
const { handleErrorsMiddleware } = require('./middleware/errorHandler');
const dotenv = require('dotenv').config();
const bodyparser = require('body-parser');
const compression = require('compression');

const officeSpaceRoutes = require('./routes/officespace');
const reservationRoutes = require('./routes/reservation');
const peopleRoutes = require('./routes/people');
const paymentRoutes = require('./routes/payment');
const contactRoutes = require('./routes/contact');
const promoRoutes = require('./routes/promo');
const authRoutes = require('./routes/auth');

const dayjs = require('dayjs');
const axios = require('axios');
const { calculateDaysWithDatesArray, calculateTotalAmount } = require('./utils');
const { verifyToken } = require('./middleware/authHandler');

const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions ={
    origin: [
        'https://spaces.orchidsprings.group',
        'http://spaces.orchidsprings.group',
        'http://admin.orchidsprings.group',
        'https://admin.orchidsprings.group',
        'http://localhost:3000'
    ], 
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', 'frontend');
//Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(compression());



app.get('/api',(req,res) => res.render('welcome',{ title: "API" }))
app.use('/api/space', officeSpaceRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/auth', authRoutes);

app.post('/api/test', (req,res) => {
    console.log(req.body)
    res.status(200).json(req.body)
})


app.get('/', (req,res) => {
    const title = "Home"
    res.render('index',{ title });
})

app.get('/admin', (req,res) => {
    const title = "Admin"
    res.render('./admin', {title})
})

app.get('/booking', async (req,res) => {
    try {
        const title = "Booking"
        const deskspaces = await axios.get(`${process.env.ENDPOINT}/api/space?type=space`);
        const roomspaces = await axios.get(`${process.env.ENDPOINT}/api/space?type=room`);
        const { start_date, end_date, pcode } = req.query;
        let promoCode = null
        if(pcode) {
            promoCode = await axios.get(`${process.env.ENDPOINT}/api/promo/${pcode}`)
        }
        if(!start_date || !end_date) res.redirect('/');
    
        const dates = calculateDaysWithDatesArray(start_date, end_date);

        res.render('booking',{ title, deskspaces: deskspaces.data, roomspaces: roomspaces.data, dates, promoCode: promoCode?.data })

    } catch (error) {
        res.render('error',{ title: 'Bad request'})
    }
})

app.get('/booking-details', async(req,res) => {
    try {
        const title = "Booking Details"
        res.render('booking-details',{ title })
    } catch (error) {
        res.render('error',{ title: 'Bad request'})
    }
})

app.post('/payment', async(req,res) => {
    try {
        const { data } = await axios.post(`${process.env.ENDPOINT}/api/reservation/cost`, req.body);
        if(data) {
            const title = "Payment"
            res.render('pay', { title, data });
        }
    } catch (error) {
        res.render('error',{ title: 'Bad request'})
    }
})

app.get('/confirmation', async (req,res) => {
    const { status, tx_ref } = req.query;
    try {
        const { data } = await axios.get(`${process.env.ENDPOINT}/api/payment/${tx_ref}`);
        const title = "Confirmation"
        res.render('confirmation',{ title, status, data })

    } catch (error) {
        res.render('error',{ title: 'Bad request'})
    }
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

app.get('/gallery', async (req,res) => {
    const title = "Gallery"
    res.render('gallery',{ title })
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