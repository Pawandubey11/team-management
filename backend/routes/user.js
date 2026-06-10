const express = require('express');
const {
  createUser,
  getUsers,
  getUser,
  assignDepartment,
  toggleUserStatus
} = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', requireAdmin, createUser);
router.get('/', getUsers);
router.get('/:userId', getUser);
router.put('/:userId/department', requireAdmin, assignDepartment);
router.put('/:userId/status', requireAdmin, toggleUserStatus);

module.exports = router;
