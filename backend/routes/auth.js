// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key_12345';

// สร้าง JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    ลงทะเบียนผู้ใช้ใหม่
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Register request received:', { email: req.body.email });
        const { email, password } = req.body;

        // ตรวจสอบข้อมูล
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกอีเมลและรหัสผ่าน'
            });
        }

        // ตรวจสอบรูปแบบอีเมล
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'รูปแบบอีเมลไม่ถูกต้อง'
            });
        }

        // ตรวจสอบความยาวรหัสผ่าน
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
            });
        }

        // ตรวจสอบว่ามี email นี้ในระบบหรือไม่
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'อีเมลนี้ถูกใช้แล้ว'
            });
        }

        // สร้างผู้ใช้ใหม่
        console.log('🔄 Creating new user...');
        console.log('📧 Email:', email.toLowerCase());
        console.log('🔐 Password provided:', password ? '[HIDDEN]' : '[MISSING]');
        
        try {
            const user = await User.createUser({
                email: email.toLowerCase(),
                password,
                role: 'user'
            });
            
            console.log('✅ User created successfully:', user.email);
            console.log('🆔 User ID:', user._id);
            console.log('👤 User role:', user.role);
            console.log('📋 Approval status:', user.approvalStatus);
            
            // สร้าง token
            const token = generateToken(user._id);
            
            res.status(201).json({
                success: true,
                _id: user._id,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus,
                profileComplete: user.profileComplete,
                token: token
            });
            
        } catch (error) {
            console.error('❌ Registration error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            res.status(500).json({ 
                success: false,
                message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
                error: error.message 
            });
        }
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        console.error('Stack:', error.stack);
        
        // ถ้า error เป็น "next is not a function"
        if (error.message && error.message.includes('next is not a function')) {
            return res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
                error: 'Middleware configuration error - please check server.js'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    เข้าสู่ระบบ
router.post('/login', async (req, res) => {
    try {
        console.log('🔑 Login attempt:', req.body.email);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกอีเมลและรหัสผ่าน'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        console.log('✅ Login successful:', email);

        res.json({
            success: true,
            _id: user._id,
            email: user.email,
            role: user.role,
            approvalStatus: user.approvalStatus,
            profileComplete: user.profileComplete,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    ข้อมูลผู้ใช้ปัจจุบัน
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'ไม่พบ Token'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(401).json({
            success: false,
            message: 'Token ไม่ถูกต้องหรือหมดอายุ'
        });
    }
});

module.exports = router;