const mongoose = require("mongoose")

async function connectDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://abhinavkum07:abhinavkum07@avidb.3z8gl.mongodb.net/invoice?retryWrites=true&w=majority",
      {
        serverSelectionTimeoutMS: 5000,
      }
    )
    console.log("Connected to the database successfully")
  } catch (error) {
    console.log("MongoDB connection error:", error.message || error)
  }
}

module.exports = connectDB
