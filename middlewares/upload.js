const multer = require("multer")
const path = require("path") // Add this line to import the 'path' module

// Store file in memory instead of disk
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|csv|jpg|jpeg/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase() // Here 'path' is used
    )

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only .pdf, .csv, and .jpg files are allowed!"))
    }
  },
})

module.exports = upload
