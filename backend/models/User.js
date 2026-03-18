const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    profileComplete: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ตรวจสอบ password
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Static method to create user with hashed password
UserSchema.statics.createUser = async function(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log('🔐 Password hashed in createUser method');
    return this.create({
        ...userData,
        password: hashedPassword
    });
};

module.exports = mongoose.model('User', UserSchema);
