const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const sendEmail = require("../services/email.service")

exports.register = async (req, res) => {

  const { name, email, password } = req.body
  const hash = await bcrypt.hash(password, 10)
  const verifyToken = crypto.randomBytes(32).toString("hex")

  const user = new User({
    name,
    email,
    password: hash,
    verifyToken
  })

  await user.save()

  const verifyLink =
    `http://localhost:3000/verify?token=${verifyToken}`

  await sendEmail(email, verifyLink)

  res.json({
    msg: "register success, check email"
  })

}



exports.verifyEmail = async (req, res) => {

  const { token } = req.query

  const user = await User.findOne({
    verifyToken: token
  })

  if (!user) {
    return res.status(400).send("invalid token")
  }

  user.emailVerified = true
  user.verifyToken = null

  await user.save()

  res.send("email verified")

}



/*
exports.login = async (req, res) => {

  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    return res.status(400).json({ msg: "user not found" })
  }

  const match = await bcrypt.compare(password, user.password)

  if (!match) {
    return res.status(400).json({ msg: "wrong password" })
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )

  res.json({ token })
}
*/


exports.login = async (req, res) => {

  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    return res.status(400).json({
      msg: "user not found"
    })
  }

  if (!user.emailVerified) {
    return res.status(400).json({
      msg: "please verify email"
    })
  }

  const match = await bcrypt.compare(password, user.password)

  if (!match) {
    return res.status(400).json({
      msg: "wrong password"
    })
  }

  res.json({
    msg: "login success"
  })

}

