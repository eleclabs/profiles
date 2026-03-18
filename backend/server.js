require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const adminRoutes = require("./routes/admin.routes")

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

//console.log("Mongo URI:", process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected")
  })
  .catch(err => {
    console.log(err)
  })

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/admin", adminRoutes)

app.listen(PORT, () => {
  console.log("server running on port " + PORT)
})

