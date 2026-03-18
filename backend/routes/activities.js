const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Activity = require('../models/Activities');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'activities');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB' });
    }
    return res.status(400).json({ message: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์: ' + err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// @route   GET /api/activities
// @desc    Get all activities (public)
router.get('/public', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/activities
// @desc    Get all activities (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/activities
// @desc    Create new activity
router.post('/', protect, admin, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const newActivity = new Activity({
      title,
      description,
      image: req.file ? `uploads/activities/${req.file.filename}` : null
    });
    
    await newActivity.save();
    
    res.json({ 
      success: true, 
      message: 'สร้างกิจกรรมเรียบร้อย',
      activity: newActivity 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/activities/:id
// @desc    Update activity
router.put('/:id', protect, admin, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'ไม่พบกิจกรรม' });
    }
    
    // Delete old image if new image is uploaded
    if (req.file && activity.image) {
      const oldImagePath = path.join(__dirname, '..', activity.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    activity.title = title;
    activity.description = description;
    if (req.file) {
      activity.image = `uploads/activities/${req.file.filename}`;
    }
    activity.updatedAt = Date.now();
    
    await activity.save();
    
    res.json({ 
      success: true, 
      message: 'อัพเดทกิจกรรมเรียบร้อย',
      activity: activity 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/activities/:id
// @desc    Delete activity
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'ไม่พบกิจกรรม' });
    }
    
    // Delete image file if exists
    if (activity.image) {
      const imagePath = path.join(__dirname, '..', activity.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Activity.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'ลบกิจกรรมเรียบร้อย' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/activities/:id
// @desc    Get single activity by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching activity with ID:', req.params.id);
        const activity = await Activity.findById(req.params.id);
        console.log('Found activity:', activity);
        
        if (!activity) {
            console.log('Activity not found for ID:', req.params.id);
            return res.status(404).json({ message: 'ไม่พบกิจกรรม' });
        }
        
        console.log('Sending activity data:', activity);
        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
