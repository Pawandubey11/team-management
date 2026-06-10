const express = require('express');
const { createCompany, getCompany, updateCompany } = require('../controllers/companyController');
const { authenticate, requireAdmin, requireSameCompany } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', requireAdmin, createCompany);
router.get('/:companyId', requireSameCompany('companyId'), getCompany);
router.put('/:companyId', requireAdmin, requireSameCompany('companyId'), updateCompany);

module.exports = router;
