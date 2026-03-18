const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = 'my_secret_key_12345';

// สร้าง JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    ลงทะเบียนผู้ใช้ใหม่
router.post('/register', async (req, res) => {
    try {
        console.log('Register request received:', req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
        }
        
        console.log('Checking if user exists with email:', email);
        // ตรวจสอบว่ามี email นี้ในระบบหรือไม่
        const userExists = await User.findOne({ email });
        console.log('User exists result:', userExists);
        
        if (userExists) {
            console.log('User already exists');
            return res.status(400).json({ message: 'อีเมลนี้ถูกใช้แล้ว' });
        }
        
        console.log('Creating new user...');
        // สร้างผู้ใช้ใหม่ (role เป็น user เสมอ)
        const user = await User.createUser({
            email,
            password,
            role: 'user'
        });
        
        console.log('User created successfully:', user);
        res.status(201).json({
            _id: user._id,
            email: user.email,
            role: user.role,
            approvalStatus: user.approvalStatus,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    เข้าสู่ระบบ
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // ตรวจสอบผู้ใช้
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }
        
        // ตรวจสอบ password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }
        
        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            approvalStatus: user.approvalStatus,
            profileComplete: user.profileComplete,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
