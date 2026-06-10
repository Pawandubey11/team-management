const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    enum: {
      values: ['Frontend', 'Backend', 'Sales', 'Production', 'HR'],
      message: '{VALUE} is not a valid department'
    }
  },
  description: {
    type: String,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index: department name must be unique per company
departmentSchema.index({ name: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
