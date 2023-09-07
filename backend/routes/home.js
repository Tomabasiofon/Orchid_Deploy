// // const express = require('express');
// // const axios = require('axios');

// // const router = express.Router();

// // router.post('/start', (req,res,next) => {
// //     try {
// //         axios.post('https://orchidspring2.onrender.com/api/reservation/check')
// //         .then(function(response){
// //             res.render('booking', { available : response.data });
// //         })
// //         .catch(err =>{
// //            next(err)
// //         })
// //     } catch (error) {
// //         next(error)
// //     }
// // })


// // module.exports = router

// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');

// // Parse form data
// app.use(bodyParser.urlencoded({ extended: true }));

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost/your-database-name', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// // Reservation model schema
// const Reservation = mongoose.model('Reservation', {
//     space_id: String,
//     start_date: Date,
//     end_date: Date
// });

// // Handle form submission
// app.post('/submitReservations', async (req, res) => {
//     try {
//         const reservationsData = req.body.reservation;

//         // Process each selected reservation
//         for (const data of reservationsData) {
//             const [space_id, start_date, end_date] = data.split(',');
            
//             // Create a new Reservation document and save it to the database
//             const reservation = new Reservation({
//                 space_id,
//                 start_date: new Date(start_date),
//                 end_date: new Date(end_date)
//             });
            
//             await reservation.save();
//         }

//         res.send('Reservations submitted successfully!');
//     } catch (error) {
//         console.error('Error submitting reservations:', error);
//         res.status(500).send('Internal server error');
//     }
// });

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });
