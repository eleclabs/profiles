const express = require('express');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/approved-profiles/approved
// @desc    ดึงโปรไฟล์ที่อนุมัติแล้วทั้งหมด
router.get('/approved', protect, async (req, res) => {
    try {
        const profiles = await Profile.find({ 
            isApproved: true 
        }).populate({
            path: 'userId',
            select: 'email role approvalStatus'
        });
        
        res.json(profiles);
    } catch (error) {
        console.error('Error fetching approved profiles:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/approved-profiles/:userId
// @desc    ดึงโปรไฟล์ตาม userId
router.get('/:userId', protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ 
            userId: req.params.userId,
            isApproved: true 
        }).populate({
            path: 'userId',
            select: 'email role approvalStatus'
        });
        
        if (!profile) {
            return res.status(404).json({ message: 'ไม่พบโปรไฟล์' });
        }
        
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;