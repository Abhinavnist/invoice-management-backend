const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    console.log("connection")
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/invoice")
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1) // Exit process with failure
  }
}

module.exports = connectDB
