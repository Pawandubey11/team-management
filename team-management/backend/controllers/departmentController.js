const Department = require('../models/Department');
const User = require('../models/User');
const Group = require('../models/Group');

/**
 * POST /api/departments
 * Create department (Admin only)
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const companyId = req.user.companyId._id;

    const existing = await Department.findOne({ name, companyId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Department already exists.' });
    }

    const department = await Department.create({ name, description, companyId });

    // Auto-create a group for this department
    await Group.create({
      name: `${name} Team`,
      description: `Chat group for ${name} department`,
      companyId,
      departmentId: department._id
    });

    res.status(201).json({ success: true, message: 'Department and group created.', data: { department } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/departments
 * Admin: get all departments in company
 * Employee: get only their department
 */
const getDepartments = async (req, res, next) => {
  try {
    const companyId = req.user.companyId._id;

    let query = { companyId };
    if (req.user.role === 'EMPLOYEE') {
      query._id = req.user.departmentId._id;
    }

    const departments = await Department.find(query).lean();

    // Enrich with member counts
    const enriched = await Promise.all(departments.map(async (dept) => {
      const memberCount = await User.countDocuments({
        companyId,
        departmentId: dept._id,
        isActive: true
      });
      return { ...dept, memberCount };
    }));

    res.json({ success: true, data: { departments: enriched } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/departments/:departmentId
 * Get single department (access controlled)
 */
const getDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const companyId = req.user.companyId._id;

    const department = await Department.findOne({ _id: departmentId, companyId });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const members = await User.find({
      companyId,
      departmentId: department._id,
      isActive: true
    }).select('-password');

    res.json({ success: true, data: { department, members } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/departments/:departmentId
 * Update department (Admin only)
 */
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findOneAndUpdate(
      { _id: req.params.departmentId, companyId: req.user.companyId._id },
      { description: req.body.description },
      { new: true, runValidators: true }
    );
    if (!department) return res.status(404).json({ success: false, message: 'Department not found.' });
    res.json({ success: true, data: { department } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDepartment, getDepartments, getDepartment, updateDepartment };
