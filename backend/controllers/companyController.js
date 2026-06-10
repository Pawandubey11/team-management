const Company = require('../models/Company');
const Department = require('../models/Department');
const User = require('../models/User');

/**
 * POST /api/company
 * Create a new company (Admin only)
 */
const createCompany = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const company = await Company.create({ name, description });
    res.status(201).json({ success: true, message: 'Company created.', data: { company } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/company/:companyId
 * Get company details with stats
 */
const getCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });

    const [departmentCount, employeeCount] = await Promise.all([
      Department.countDocuments({ companyId }),
      User.countDocuments({ companyId, role: 'EMPLOYEE', isActive: true })
    ]);

    res.json({
      success: true,
      data: { company, stats: { departments: departmentCount, employees: employeeCount } }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/company/:companyId
 * Update company (Admin only)
 */
const updateCompany = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.companyId,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
    res.json({ success: true, data: { company } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCompany, getCompany, updateCompany };
