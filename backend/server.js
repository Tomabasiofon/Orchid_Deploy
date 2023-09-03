const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieparser = require('cookie-parser');
const { connectDB } = require('./config/db');
const { handleErrorsMiddleware } = require('./middleware/errorHandler');
const dotenv = require('dotenv').config();

const officeSpaceRoutes = require('./routes/officespace');
const reservationRoutes = require('./routes/reservation');
const peopleRoutes = require('./routes/people');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

app.use('/api/space', officeSpaceRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/people', peopleRoutes);
//Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname, '../', 'frontend', 'index.html'))
})


// Handle Errors
app.use(handleErrorsMiddleware);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    connectDB()
})