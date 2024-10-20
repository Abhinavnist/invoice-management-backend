const express = require("express")
const router = express.Router()
const {
  loginUser,
  forgotPassword,
  resetPassword,
  signupUser,
} = require("../controllers/authController")

router.post("/signup", signupUser)
router.post("/login", loginUser)
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:token", resetPassword)

module.exports = router
