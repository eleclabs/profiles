// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

console.log('🚀 Starting server...');

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/profile2')
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
    });

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logging middleware - ถูกต้อง
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next(); // มี next parameter และเรียก next()
});

// ✅ Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
console.log('📂 Loading route files...');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const approvedProfilesRoutes = require('./routes/approved_profiles');
const activitiesRoutes = require('./routes/activities');
const jobsRoutes = require('./routes/jobs');
console.log('✅ Route files loaded successfully');

app.use('/api/auth', authRoutes);
console.log('🔗 Auth routes mounted at /api/auth');
app.use('/api/profile', profileRoutes);
console.log('🔗 Profile routes mounted at /api/profile');
app.use('/api/admin', adminRoutes);
console.log('🔗 Admin routes mounted at /api/admin');
app.use('/api/approved-profiles', approvedProfilesRoutes);
console.log('🔗 Approved profiles routes mounted at /api/approved-profiles');
app.use('/api/activities', activitiesRoutes);
console.log('🔗 Activities routes mounted at /api/activities');
app.use('/api/jobs', jobsRoutes);
console.log('🔗 Jobs routes mounted at /api/jobs');

// ✅ Test route
app.get('/', (req, res) => {
    res.json({ 
        message: '✅ API is running...',
        timestamp: new Date().toISOString()
    });
});

// ✅ 404 handler - ต้องไม่มี next() ในนี้
app.use((req, res, next) => {
    console.log(`❌ 404: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Route not found' });
    next(); // Added next() parameter
});

// ✅ Error handler - ต้องมี 4 parameters
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    res.status(500).json({ 
        success: false,
        message: 'Server error',
        error: err.message 
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Test: http://localhost:${PORT}`);
});