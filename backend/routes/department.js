const express = require('express');
const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment
} = require('../controllers/departmentController');
const { authenticate, requireAdmin, requireDepartmentAccess } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', requireAdmin, createDepartment);
router.get('/', getDepartments);
router.get('/:departmentId', requireDepartmentAccess, getDepartment);
router.put('/:departmentId', requireAdmin, updateDepartment);

module.exports = router;
