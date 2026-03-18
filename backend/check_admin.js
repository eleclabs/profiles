const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.js');

mongoose.connect('mongodb://localhost:27017/profile2')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@gmail.com' });
    console.log('Admin user found:', adminUser ? 'Yes' : 'No');
    
    if (adminUser) {
      console.log('Admin user details:', {
        email: adminUser.email,
        role: adminUser.role,
        approvalStatus: adminUser.approvalStatus
      });
    } else {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        approvalStatus: 'approved'
      });
      console.log('Admin user created:', admin.email);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
