const express = require("express")

const router = express.Router()

const auth = require("../middleware/auth")
const role = require("../middleware/role")

const adminController = require("../controllers/admin.controller")

router.get("/users",
 auth,
 role("admin"),
 adminController.users
)

module.exports = router