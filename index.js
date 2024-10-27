const express = require("express")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const cors = require("cors")
const { processInvoice } = require("./controllers/invoiceController")
const upload = require("./middlewares/upload")
const multer = require("multer")

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use((req, res, next) => {
  console.log("Headers:", req.headers)
  console.log("Body:", req.body)
  next()
})

app.get("/", (req, res) => {
  res.json({ message: " connected backend-server" })
})
app.use(express.urlencoded({ extended: true }))

// Route to handle invoice file upload
app.post(
  "/upload-invoice",
  (req, res, next) => {
    upload.single("invoice")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred
        return res.status(400).json({ message: err.message })
      } else if (err) {
        // An unknown error occurred
        return res.status(500).json({ message: err.message })
      }

      // If no file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
      }

      // Process the invoice
      next()
    })
  },
  processInvoice
)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
