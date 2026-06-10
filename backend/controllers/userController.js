const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');

/**
 * POST /api/users
 * Create employee (Admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, departmentId } = req.body;
    const companyId = req.user.companyId._id;

    // Validate department belongs to company
    if (departmentId) {
      const dept = await Department.findOne({ _id: departmentId, companyId });
      if (!dept) {
        return res.status(400).json({ success: false, message: 'Invalid department for this company.' });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId,
      departmentId: departmentId || null
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, message: 'Employee created.', data: { user: userObj } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users
 * Admin: get all users in company
 * Employee: get only their department members
 */
const getUsers = async (req, res, next) => {
  try {
    const companyId = req.user.companyId._id;
    let query = { companyId };

    if (req.user.role === 'EMPLOYEE') {
      query.departmentId = req.user.departmentId._id;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('departmentId', 'name')
      .sort({ name: 1 });

    res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:userId
 * Get user (access controlled)
 */
const getUser = async (req, res, next) => {
  try {
    const companyId = req.user.companyId._id;
    const user = await User.findOne({ _id: req.params.userId, companyId })
      .select('-password')
      .populate('departmentId', 'name description');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Employee can only view users in same department
    if (req.user.role === 'EMPLOYEE') {
      const userDeptId = req.user.departmentId?._id?.toString();
      const targetDeptId = user.departmentId?._id?.toString();
      if (userDeptId !== targetDeptId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:userId/department
 * Assign/reassign employee to department (Admin only)
 */
const assignDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.body;
    const companyId = req.user.companyId._id;

    if (departmentId) {
      const dept = await Department.findOne({ _id: departmentId, companyId });
      if (!dept) {
        return res.status(400).json({ success: false, message: 'Invalid department.' });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, companyId, role: 'EMPLOYEE' },
      { departmentId: departmentId || null },
      { new: true }
    ).select('-password').populate('departmentId', 'name');

    if (!user) return res.status(404).json({ success: false, message: 'Employee not found.' });

    res.json({ success: true, message: 'Department assigned.', data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:userId/status
 * Toggle user active status (Admin only)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, companyId: req.user.companyId._id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: { isActive: user.isActive } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getUsers, getUser, assignDepartment, toggleUserStatus };
