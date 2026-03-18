const express = require('express');
const multer = require('multer');
const path = require('path');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// ตั้งค่า multer สำหรับอัพโหลดไฟล์
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// @route   POST /api/profile
// @desc    สร้างหรืออัพเดทโปรไฟล์
router.post('/', protect, upload.fields([
    { name: 'idCardFront', maxCount: 1 },
    { name: 'idCardBack', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const profileData = JSON.parse(req.body.profileData);
        
        // Handle empty idCardNumber to prevent duplicate key error
        if (!profileData.idCardNumber || profileData.idCardNumber.trim() === '') {
            profileData.idCardNumber = null; // Set to null instead of empty string
        }
        
        // เตรียมข้อมูลรูปภาพ
        const idCardImages = {};
        if (req.files['idCardFront']) {
            idCardImages.front = req.files['idCardFront'][0].path;
        }
        if (req.files['idCardBack']) {
            idCardImages.back = req.files['idCardBack'][0].path;
        }
        
        const profileImage = req.files['profileImage'] ? req.files['profileImage'][0].path : null;
        
        // ตรวจสอบว่ามีโปรไฟล์แล้วหรือไม่
        let profile = await Profile.findOne({ userId: req.user._id });
        
        if (profile) {
            // อัพเดทโปรไฟล์ที่มีอยู่
            profile = await Profile.findOneAndUpdate(
                { userId: req.user._id },
                { 
                    ...profileData,
                    idCardImages,
                    profileImage,
                    updatedAt: Date.now()
                },
                { new: true }
            );
        } else {
            // สร้างโปรไฟล์ใหม่
            profile = await Profile.create({
                userId: req.user._id,
                ...profileData,
                idCardImages,
                profileImage
            });
        }
        
        // อัพเดทสถานะ profileComplete ใน User
        await User.findByIdAndUpdate(req.user._id, { profileComplete: true });
        
        res.json({ success: true, profile });
    } catch (error) {
        console.error('Profile creation error:', error);
        
        // Handle duplicate key errors specifically
        if (error.code === 11000) {
            let field = 'unknown field';
            if (error.message.includes('idCardNumber')) {
                field = 'เลขบัตรประชาชน';
            } else if (error.message.includes('email')) {
                field = 'อีเมล';
            }
            
            return res.status(400).json({ 
                success: false, 
                message: `${field} นี้ถูกใช้ไปแล้ว กรุณาตรวจสอบข้อมูล`,
                error: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 
            error: error.message 
        });
    }
});

// @route   GET /api/profile
// @desc    ดึงข้อมูลโปรไฟล์ของผู้ใช้
router.get('/', protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
