const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({

    name: String,

    email: {
        type: String,
        unique: true
    },

    password: String,

    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },

    avatar: {
        url: String,
        public_id: String
    },

    emailVerified: {
        type: Boolean,
        default: false
    },

    verifyToken: String

}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)

