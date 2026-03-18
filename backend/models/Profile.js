const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    // เชื่อมโยงกับ User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // ข้อมูลส่วนตัว
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    nickName: String,
    
    // ข้อมูลที่อยู่
    address: {
        houseNo: String,
        village: String,
        soi: String,
        road: String,
        subDistrict: String,
        district: String,
        province: String,
        postalCode: String
    },
    
    // ข้อมูลส่วนบุคคล
    idCardNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    age: Number,
    birthDate: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        default: ''
    },
    nationality: String,
    bloodType: {
        type: String,
        enum: ['A', 'B', 'AB', 'O', ''],
        default: ''
    },
    weight: Number,
    height: Number,
    
    // ข้อมูลติดต่อ
    phoneNumber: String,
    socialMedia: {
        facebook: String,
        line: String,
        instagram: String,
        twitter: String,
        tiktok: String
    },
    
    // ข้อมูลเพิ่มเติม
    lifestyle: String,
    hobbies: [String],
    
    // รูปภาพ
    idCardImages: {
        front: String,  // path to image
        back: String    // path to image
    },
    profileImage: String,
    
    // สถานะ
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Profile', ProfileSchema);
