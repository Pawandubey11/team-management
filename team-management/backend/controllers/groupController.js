const Group = require('../models/Group');
const Department = require('../models/Department');

/**
 * POST /api/groups
 * Create group for a department (Admin only)
 */
const createGroup = async (req, res, next) => {
  try {
    const { name, description, departmentId } = req.body;
    const companyId = req.user.companyId._id;

    const dept = await Department.findOne({ _id: departmentId, companyId });
    if (!dept) return res.status(400).json({ success: false, message: 'Invalid department.' });

    const existing = await Group.findOne({ departmentId, companyId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A group already exists for this department.' });
    }

    const group = await Group.create({ name, description, companyId, departmentId });
    res.status(201).json({ success: true, data: { group } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/groups
 * Admin: all groups. Employee: only their department's group
 */
const getGroups = async (req, res, next) => {
  try {
    const companyId = req.user.companyId._id;
    let query = { companyId };

    if (req.user.role === 'EMPLOYEE') {
      if (!req.user.departmentId) {
        return res.json({ success: true, data: { groups: [] } });
      }
      query.departmentId = req.user.departmentId._id;
    }

    const groups = await Group.find(query)
      .populate('departmentId', 'name description')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: { groups } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/groups/:groupId
 * Get group (access controlled)
 */
const getGroup = async (req, res, next) => {
  try {
    const companyId = req.user.companyId._id;
    const group = await Group.findOne({ _id: req.params.groupId, companyId })
      .populate('departmentId', 'name description');

    if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

    // Employee: ensure group belongs to their department
    if (req.user.role === 'EMPLOYEE') {
      const userDeptId = req.user.departmentId?._id?.toString();
      if (group.departmentId._id.toString() !== userDeptId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    res.json({ success: true, data: { group } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGroup, getGroups, getGroup };
