const User = require("../models/User")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" })
}

// Register a new user
exports.signupUser = async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Will be hashed due to pre-save middleware in the model
    })

    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body
  console.log(req.body)

  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    res.json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex")
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // Token expires in 10 minutes
    await user.save()

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetpassword/${resetToken}`
    const message = `You requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message,
      })
      res.status(200).json({ message: "Email sent" })
    } catch (error) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()
      res.status(500).json({ message: "Email could not be sent" })
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

// Reset Password
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({
      message: "Password updated successfully",
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
