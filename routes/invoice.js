const express = require("express")
const router = express.Router()

router.post(
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
module.exports = router
