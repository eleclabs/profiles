const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.js');

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Check if admin user exists
        const adminUser = await User.findOne({ email: 'admin@gmail.com' });
        
        if (adminUser) {
            console.log('Admin user already exists');
            console.log('Email:', adminUser.email);
            console.log('Role:', adminUser.role);
            console.log('Status:', adminUser.approvalStatus);
        } else {
            console.log('Creating admin user...');
            const admin = await User.create({
                email: 'admin@gmail.com',
                password: 'admin123',
                role: 'admin',
                approvalStatus: 'approved'
            });
            console.log('Admin user created successfully');
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
        }
        
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createAdmin();
