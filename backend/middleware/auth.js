// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key_12345';

const protect = async (req, res, next) => {
    console.log('🔒 protect middleware called');
    
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token found');
            
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token verified for user ID:', decoded.id);
            
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                console.log('User not found');
                return res.status(401).json({ message: 'Not authorized - user not found' });
            }
            
            console.log('✅ User authorized:', req.user.email);
            next(); // เรียก next() เพื่อไปยัง middleware ถัดไป
        } else {
            console.log('No token provided');
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
    } catch (error) {
        console.error('❌ Auth error:', error.message);
        return res.status(401).json({ message: 'Not authorized - ' + error.message });
    }
};

const admin = (req, res, next) => {
    console.log('👑 admin middleware called');
    console.log('User role:', req.user?.role);
    
    try {
        if (req.user && req.user.role === 'admin') {
            console.log('✅ Admin authorized');
            next(); // เรียก next() เพื่อไปยัง route handler
        } else {
            console.log('❌ Not admin');
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ message: 'Server error in admin middleware' });
    }
};

module.exports = { protect, admin, JWT_SECRET };