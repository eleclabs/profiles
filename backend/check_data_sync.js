const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Activity = require('./models/Activities');

require('dotenv').config();

const checkDataSync = async () => {
    try {
        // เชื่อมต่อ MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/profile2');
        console.log('✅ MongoDB Connected Successfully');
        console.log('📊 Database: profile2');
        console.log('=====================================');

        // ตรวจสอบ Users
        const userCount = await User.countDocuments();
        const users = await User.find().select('-password');
        console.log(`👥 Users: ${userCount} records`);
        users.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email} | Role: ${user.role} | Status: ${user.approvalStatus}`);
        });

        // ตรวจสอบ Profiles
        const profileCount = await Profile.countDocuments();
        const profiles = await Profile.find().populate('userId', 'email');
        console.log(`\n📋 Profiles: ${profileCount} records`);
        profiles.forEach((profile, index) => {
            console.log(`   ${index + 1}. ${profile.firstName} ${profile.lastName} | Email: ${profile.userId?.email || 'N/A'} | Approved: ${profile.isApproved}`);
        });

        // ตรวจสอบ Activities
        const activityCount = await Activity.countDocuments();
        const activities = await Activity.find();
        console.log(`\n🎯 Activities: ${activityCount} records`);
        activities.forEach((activity, index) => {
            console.log(`   ${index + 1}. ${activity.title} | Has Image: ${activity.image ? 'Yes' : 'No'}`);
        });

        console.log('\n=====================================');
        console.log('📈 สรุปข้อมูล:');
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Profiles: ${profileCount}`);
        console.log(`   - Activities: ${activityCount}`);
        
        // ตรวจสอบความสมบูรณ์ของข้อมูล
        console.log('\n🔍 ตรวจสอบความสมบูรณ์:');
        const usersWithoutProfiles = userCount - profileCount;
        if (usersWithoutProfiles > 0) {
            console.log(`   ⚠️  Users ที่ยังไม่มี Profile: ${usersWithoutProfiles}`);
        }
        
        const pendingUsers = await User.countDocuments({ approvalStatus: 'pending' });
        if (pendingUsers > 0) {
            console.log(`   ⏳ Users ที่รอการอนุมัติ: ${pendingUsers}`);
        }
        
        const approvedUsers = await User.countDocuments({ approvalStatus: 'approved' });
        console.log(`   ✅ Users ที่ได้รับการอนุมัติ: ${approvedUsers}`);

    } catch (error) {
        console.error('❌ Error checking data sync:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

checkDataSync();
