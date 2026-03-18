const express = require('express');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Activity = require('../models/Activities');
const bcrypt = require('bcryptjs');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/admin/pending-approvals
// @desc    ดึงรายการที่รออนุมัติ
router.get('/pending-approvals', protect, admin, async (req, res) => {
    try {
        const pendingUsers = await User.find({ 
            role: 'user', 
            approvalStatus: 'pending',
            profileComplete: true 
        }).select('-password');
        
        const profiles = await Profile.find({ 
            userId: { $in: pendingUsers.map(u => u._id) } 
        }).populate('userId', 'email');
        
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/approve/:userId
// @desc    อนุมัติผู้ใช้
router.put('/approve/:userId', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.approvalStatus = 'approved';
        await user.save();
        
        // อัพเดทโปรไฟล์
        await Profile.findOneAndUpdate(
            { userId: user._id },
            { 
                isApproved: true,
                approvedBy: req.user._id,
                approvedAt: Date.now()
            }
        );
        
        res.json({ success: true, message: 'User approved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/reject/:userId
// @desc    ปฏิเสธผู้ใช้
router.put('/reject/:userId', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.approvalStatus = 'rejected';
        await user.save();
        
        res.json({ success: true, message: 'User rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/init-data
// @desc    สร้างข้อมูลเริ่มต้น
router.post('/init-data', async (req, res) => {
    try {
        // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
        const userCount = await User.countDocuments();
        if (userCount > 3) {
            return res.json({ message: 'ระบบมีข้อมูลอยู่แล้ว' });
        }

        // สร้าง users
        const users = [];
        const testUsers = [
            { email: 'user1@test.com', password: '123456', firstName: 'สมชาย', lastName: 'ใจดี', nickName: 'ชาย' },
            { email: 'user2@test.com', password: '123456', firstName: 'สมหญิง', lastName: 'รักดี', nickName: 'หญิง' },
            { email: 'user3@test.com', password: '123456', firstName: 'สมศักดิ์', lastName: 'มีสุข', nickName: 'ศักดิ์' }
        ];

        for (const testUser of testUsers) {
            // สร้าง user
            const hashedPassword = await bcrypt.hash(testUser.password, 10);
            const user = await User.create({
                email: testUser.email,
                password: hashedPassword,
                role: 'user',
                approvalStatus: 'approved',
                profileComplete: true
            });
            users.push(user);

            // สร้าง profile
            await Profile.create({
                userId: user._id,
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                nickName: testUser.nickName,
                address: {
                    houseNo: '123',
                    village: '4',
                    soi: '5',
                    road: 'สุขุมวิท',
                    subDistrict: 'คลองเตย',
                    district: 'คลองเตย',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110'
                },
                age: 25,
                birthDate: new Date('1995-01-01'),
                gender: testUser.email === 'user1@test.com' ? 'male' : 'female',
                nationality: 'ไทย',
                bloodType: 'O',
                weight: 65,
                height: 170,
                phoneNumber: '0812345678',
                socialMedia: {
                    facebook: testUser.email.split('@')[0],
                    line: testUser.email.split('@')[0],
                    instagram: '@' + testUser.email.split('@')[0],
                    twitter: '',
                    tiktok: ''
                },
                lifestyle: 'ชอบท่องเที่ยว ดูหนัง ฟังเพลง อ่านหนังสือ',
                hobbies: ['อ่านหนังสือ', 'ดูหนัง', 'ฟังเพลง', 'ท่องเที่ยว'],
                isApproved: true,
                approvedAt: new Date()
            });
        }

        // สร้าง test activities
        const testActivities = [
            {
                title: 'กิจกรรมวิ่งวัน',
                description: 'กิจกรรมจัดงานวิ่งวันสำหรับนักเรียน ม.1-ม.6 เพื่อพัฒนาการเรียนและสร้างความสัมพันธ์ระหว่างรุ่นพี่รุ่งน้อง'
            },
            {
                title: 'กิจกรรมกีฬาวิจย์',
                description: 'ทักษะวันวิทยาการณ์และสร้างสรรพค์ที่เป็นประโยช์ต่อสาธารณชุมชนสังคม และนำเสนอผลิตภพวงาน'
            },
            {
                title: 'กิจกรรมกีฬากรรม',
                description: 'จัดงานกีฬากรรมเพื่อส่งเสริมความรู้และสร้างความทีนักเรียนรู้จักกับธรรมชาติ'
            }
        ];

        for (const testActivity of testActivities) {
            await Activity.create(testActivity);
        }

        res.json({ 
            success: true, 
            message: 'สร้างข้อมูลเริ่มต้นเรียบร้อย',
            users: testUsers.map(u => ({ email: u.email, password: u.password }))
        });
    } catch (error) {
        console.error('Init data error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/approve-all
// @desc    อนุมัติผู้ใช้ทั้งหมด
router.put('/approve-all', protect, admin, async (req, res) => {
    try {
        // อนุมัติผู้ใช้ทั้งหมดที่รออนุมัติ
        await User.updateMany(
            { 
                role: 'user', 
                approvalStatus: 'pending',
                profileComplete: true 
            },
            { 
                approvalStatus: 'approved'
            }
        );
        
        // อัพเดทโปรไฟล์ทั้งหมด
        await Profile.updateMany(
            { isApproved: false },
            { 
                isApproved: true,
                approvedBy: req.user._id,
                approvedAt: Date.now()
            }
        );
        
        res.json({ success: true, message: 'อนุมัติผู้ใช้ทั้งหมดเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/edit-user/:userId
// @desc    แก้ไขข้อมูลผู้ใช้
router.put('/edit-user/:userId', protect, admin, async (req, res) => {
    try {
        const { firstName, lastName, email, nickName, address, age, birthDate, gender, nationality, bloodType, weight, height, phoneNumber, socialMedia, lifestyle, hobbies } = req.body;
        
        // อัพเดทข้อมูลผู้ใช้
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { email },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }
        
        // อัพเดทข้อมูลโปรไฟล์
        const profileUpdate = {};
        if (firstName !== undefined) profileUpdate.firstName = firstName;
        if (lastName !== undefined) profileUpdate.lastName = lastName;
        if (nickName !== undefined) profileUpdate.nickName = nickName;
        if (address !== undefined) profileUpdate.address = address;
        if (age !== undefined) profileUpdate.age = age;
        if (birthDate !== undefined) profileUpdate.birthDate = birthDate;
        if (gender !== undefined) profileUpdate.gender = gender;
        if (nationality !== undefined) profileUpdate.nationality = nationality;
        if (bloodType !== undefined) profileUpdate.bloodType = bloodType;
        if (weight !== undefined) profileUpdate.weight = weight;
        if (height !== undefined) profileUpdate.height = height;
        if (phoneNumber !== undefined) profileUpdate.phoneNumber = phoneNumber;
        if (socialMedia !== undefined) profileUpdate.socialMedia = socialMedia;
        if (lifestyle !== undefined) profileUpdate.lifestyle = lifestyle;
        if (hobbies !== undefined) profileUpdate.hobbies = hobbies;
        
        await Profile.findOneAndUpdate(
            { userId: req.params.userId },
            profileUpdate,
            { new: true }
        );
        
        res.json({ success: true, message: 'แก้ไขข้อมูลผู้ใช้เรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/all-users
// @desc    ดึงรายชื่อผู้ใช้ทั้งหมด
router.get('/all-users', protect, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const profiles = await Profile.find().populate('userId', 'email approvalStatus role');
        
        // รวมข้อมูล users และ profiles
        const allUsers = profiles.map(profile => {
            const user = users.find(u => u._id.toString() === profile.userId._id.toString());
            return {
                ...profile.toObject(),
                userData: user ? {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    approvalStatus: user.approvalStatus,
                    profileComplete: user.profileComplete,
                    createdAt: user.createdAt
                } : null
            };
        }).filter(item => item.userData !== null);
        
        console.log('All users data sent:', allUsers.length, 'records');
        res.json(allUsers);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/delete-user/:userId
// @desc    ลบผู้ใช้
router.delete('/delete-user/:userId', protect, admin, async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // ลบ profile ก่อน
        await Profile.findOneAndDelete({ userId });
        
        // ลบ user
        await User.findByIdAndDelete(userId);
        
        res.json({ success: true, message: 'ลบผู้ใช้เรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/revoke-approval/:userId
// @desc    เลิกอนุมัติผู้ใช้
router.put('/revoke-approval/:userId', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }
        
        // เปลี่ยนสถานะเป็น pending
        user.approvalStatus = 'pending';
        await user.save();
        
        // อัพเดทโปรไฟล์
        await Profile.findOneAndUpdate(
            { userId: user._id },
            { 
                isApproved: false,
                approvedBy: null,
                approvedAt: null
            }
        );
        
        res.json({ success: true, message: 'เลิกอนุมัติผู้ใช้เรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;