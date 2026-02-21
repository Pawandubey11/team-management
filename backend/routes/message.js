const express = require('express');
const { getGroupMessages, sendMessage, deleteMessage } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/group/:groupId', getGroupMessages);
router.post('/', sendMessage);
router.delete('/:messageId', deleteMessage);

module.exports = router;
