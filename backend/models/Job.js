const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add virtual for formatted date
JobSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('th-TH');
});

// Ensure virtuals are included in JSON
JobSchema.set('toJSON', { virtuals: true });
JobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', JobSchema);
