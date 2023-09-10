const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const createError = (status, message) => {
    const err = new Error();
    err.status = status;
    err.message = message;
    return err;
};

const calculateDays = (start_date, end_date) => {
    if (!(start_date instanceof Date)) {
        start_date = new Date(start_date);
    }
    if (!(end_date instanceof Date)) {
        end_date = new Date(end_date);
    }

    const timeDiff = end_date - start_date;
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if(days === 0){
        return 1
    } else {
        return days;
    }
};

const calculateDaysWithDatesArray = (start_date, end_date) => {
    // Parse input strings into Date objects if they are in string format
    const startDateObj = typeof start_date === 'string' ? new Date(start_date) : start_date;
    const endDateObj = typeof end_date === 'string' ? new Date(end_date) : end_date;

    // Ensure that the input dates are valid Date objects
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new Error('Invalid date format');
    }

    const days = [];
    const currentDate = new Date(startDateObj);

    while (currentDate <= endDateObj) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
};

function calculateTotalReservationAmount(reservations) {
    let totalAmount = 0;
  
    for (const reservation of reservations) {
      if (reservation && reservation.price && typeof reservation.price === 'number') {
        totalAmount += reservation.price;
      }
    }
  
    return totalAmount;
}
  
function generateDatesArray(reservations) {
    let datesArray = [];
  
    for (const reservation of reservations) {
      if (reservation && Array.isArray(reservation.dates)) {
        for (const dateString of reservation.dates) {
          const dateObject = new Date(dateString);
          if (!isNaN(dateObject.getTime())) {
            // Check if the date is valid
            datesArray.push(dateObject);
          }
        }
      }
    }
  
    return datesArray;
}

function spacesToReserve (reservations) {
    let spaces = 0;
  
    for (const reservation of reservations) {
      if (reservation && reservation.space_id) {
        spaces += 1;
      }
    }
  
    return spaces;
}

const myhtml = (fullname) => {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OSL Spaces</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
  </head>
  <body>
    <main class="container">
        <header class="row">
            <div class="col-md-6">
                <img src="assets/images/logo last.png" alt="Orchid Springs">
            </div>
        </header>
        <hr class="hr my-6">
        <div>
            <h3 class="mb-3">Hello, ${ fullname }</h3>
            <p>Thank you for contacting Orchid Springs Spaces</p>
            <p>
                Please know that we have received your message and would reply you soonest. Thank you for your patience and understanding.
            </p>
            <p>
                Regards,
            </p>
            <p>
                <b>Orchid Springs Limited</b>
            </p>
        </div>
    </main>
  </body>
</html>




`
}
const sendEmail = async (fullname, email, phonenumber, message) => {
  try {
      const transporter = nodemailer.createTransport({
          host: process.env.SMTP_SERVER,
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
      });
  
      const mailOptions = {
        from: `${process.env.EMAIL_USER}`, //list of receivers
        to: { name: `${fullname}`, address: email },
        subject: "OSL Spaces",
        html: myhtml(fullname),
    }
    await transporter.sendMail(mailOptions);
    return true

  } catch (error) {
     return false
  }
};

  




module.exports = { createError, calculateDays, calculateDaysWithDatesArray, calculateTotalReservationAmount, generateDatesArray, spacesToReserve, sendEmail }