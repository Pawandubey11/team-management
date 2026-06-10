const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).populate('companyId').populate('departmentId');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or account deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    next(error);
  }
};

/**
 * Admin-only middleware - must be used after authenticate
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

/**
 * Validate that the requested companyId matches the user's company
 * Prevents URL hacking across companies
 */
const requireSameCompany = (paramName = 'companyId') => (req, res, next) => {
  const requestedCompanyId = req.params[paramName] || req.body.companyId;
  const userCompanyId = req.user.companyId._id.toString();

  if (requestedCompanyId && requestedCompanyId !== userCompanyId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You cannot access resources from another company.'
    });
  }
  next();
};

/**
 * Validate department access for employees
 * Admins bypass this check
 */
const requireDepartmentAccess = async (req, res, next) => {
  try {
    // Admins have full access within their company
    if (req.user.role === 'ADMIN') return next();

    const departmentId = req.params.departmentId || req.body.departmentId;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required.'
      });
    }

    const userDeptId = req.user.departmentId?._id?.toString();

    if (!userDeptId || userDeptId !== departmentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own department.'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireSameCompany,
  requireDepartmentAccess
};
