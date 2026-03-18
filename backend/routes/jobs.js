const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'jobs');
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

// @route   GET /api/jobs
// @desc    Get all active jobs (public)
router.get('/public', async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/jobs
// @desc    Get all jobs (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
router.post('/', protect, admin, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    const { title, description, requirements, location, salary, type, department } = req.body;
    
    const newJob = new Job({
      title,
      description,
      requirements,
      location,
      salary,
      type,
      department,
      image: req.file ? `uploads/jobs/${req.file.filename}` : null,
      postedBy: req.user.id
    });
    
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
router.put('/:id', protect, admin, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    const { title, description, requirements, location, salary, type, department, isActive } = req.body;
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'ไม่พบตำแหน่งงาน' });
    }
    
    // Update fields
    job.title = title || job.title;
    job.description = description || job.description;
    job.requirements = requirements || job.requirements;
    job.location = location || job.location;
    job.salary = salary || job.salary;
    job.type = type || job.type;
    job.department = department || job.department;
    job.isActive = isActive !== undefined ? isActive : job.isActive;
    
    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image if exists
      if (job.image) {
        const oldImagePath = path.join(__dirname, '..', job.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      job.image = `uploads/jobs/${req.file.filename}`;
    }
    
    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'ไม่พบตำแหน่งงาน' });
    }
    
    // Delete image if exists
    if (job.image) {
      const imagePath = path.join(__dirname, '..', job.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Job.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'ลบตำแหน่งงานเรียบร้อย' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching job with ID:', req.params.id);
        const job = await Job.findById(req.params.id);
        console.log('Found job:', job);
        
        if (!job) {
            console.log('Job not found for ID:', req.params.id);
            return res.status(404).json({ message: 'ไม่พบตำแหน่งงาน' });
        }
        
        console.log('Sending job data:', job);
        res.json(job);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
