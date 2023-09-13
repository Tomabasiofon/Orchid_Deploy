const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

const createError = (status, message) => {
    const err = new Error();
    err.status = status;
    err.message = message;
    throw err;
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

const myhtml = (fullname, message) => {
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
            <div class="d-flex align-items-center">
                <img src="https://i.ibb.co/SPFqDXd/Email-logo.png" alt="Orchid Springs" border="0">
                <h4 class="text-primary">Orchid Springs</h4>
            </div>
            </div>
        </header>
        <hr class="hr my-6">
        <div>
            <h3 class="mb-3">Hello, ${ fullname }</h3>
            <p>Thank you for contacting Orchid Springs Spaces</p>
            <p>
                ${message}
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
      const message = 'Please know that we have received your message and would reply you soonest. Thank you for your patience and understanding.'
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
        html: myhtml(fullname, message),
    }
    await transporter.sendMail(mailOptions);
    return true

  } catch (error) {
     return false
  }
};



const pdfTemplate = (name,email, amount, tx_ref) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSL Spaces</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
  </head>
  <body>
    <main class="container">
      <div class="row justify-content-center py-10">
        <div class="col-10">
  
          <div>
              <div class="d-flex align-items-center">
                  <img src="https://i.ibb.co/SPFqDXd/Email-logo.png" alt="Orchid Springs" border="0">
                  <h4 class="text-primary">Orchid Springs</h4>
              </div>
            <div class="row">
              <div class="col-8">
                <hr class="hr rounded-lg" style="height: 20px; background: rgb(1, 10, 43);">
              </div>
              <div class="col-4">
                <p class="display-6 text-right">
                  INVOICE
                </p>
              </div>
  
              <div class="col-6 mb-3">
                Invoice: ${tx_ref} <br><br>
                Invoice to: <br>
                ${name}<br>
                ${email}<br>
                Amount paid: ₦ ${amount}
              </div>
            </div>
          </div>
  
          <table class="table table-striped-columns">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Details</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>Amout paid</td>
                <td>${amount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </body>
  </html>
  
  `;
}


const sendEmailWithPDF = async (fullname, email, amount, tx_ref ) => {
  try {
    // Create a PDF using puppeteer with the new headless mode
    const browser = await puppeteer.launch({
      headless: "new", // Use the new headless mode
    });
    const page = await browser.newPage();

    // Your HTML content goes here (replace this with your HTML content)
    const htmlContent = pdfTemplate(fullname, email, amount, tx_ref);

    // Navigate to a data URL containing your HTML content
    await page.goto(`data:text/html,${htmlContent}`, { waitUntil: 'networkidle0' });

    // Generate a PDF from the page
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    const message = `Thank you ${fullname} your payment is successfull. Please find attached below your receipt`
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define mail options
    const mailOptions = {
      from: `${process.env.EMAIL_USER}`,
      to: { name: `${fullname}`, address: email },
      subject: 'OSL Spaces',
      html: myhtml(fullname, message),
      attachments: [
        {
          filename: 'oslspace.pdf', // Set the filename for the attachment
          content: pdfBuffer, // Attach the PDF content
        },
      ],
    };

    // Send the email with the PDF attachment
    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};


const myNanoid = async () => {
  const nanoidModule = await import('nanoid');
  return nanoidModule;
};

const groupBySpaceId = (arr) => {
  const grouped = {};
  arr.forEach((item) => {
    const { space_id, current_date } = item;
    if (!grouped[space_id]) {
      grouped[space_id] = { space_id, dates: [current_date] };
    } else {
      grouped[space_id].dates.push(current_date);
    }
  });
  return Object.values(grouped);
}

function calculateTotalAmount(data) {
  let totalAmount = 0;
  
    data.forEach((pay) => {
      if (pay.amount) {
        totalAmount += pay.amount;
      }
    });
  
  return totalAmount;
}






module.exports = { createError, calculateDays, calculateDaysWithDatesArray, calculateTotalReservationAmount, generateDatesArray, spacesToReserve, sendEmail, myNanoid, groupBySpaceId, sendEmailWithPDF, calculateTotalAmount }