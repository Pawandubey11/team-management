const express = require('express');
const { createGroup, getGroups, getGroup } = require('../controllers/groupController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', requireAdmin, createGroup);
router.get('/', getGroups);
router.get('/:groupId', getGroup);

module.exports = router;
