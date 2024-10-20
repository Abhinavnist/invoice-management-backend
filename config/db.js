const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://abhinavpatna55:abhinavpatna55@lms.uh6brsm.mongodb.net/invoice"
    )
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1) // Exit process with failure
  }
}

module.exports = connectDB
