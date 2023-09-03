const dotenv = require('dotenv');
const mongoose = require('mongoose');


dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.log(error)
  }
}

module.exports = { connectDB }