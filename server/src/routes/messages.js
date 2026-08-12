const express = require('express');
const router = express.Router();
const { getMessages, createMessage, deleteMessage } = require('../controllers/messageController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', getMessages);
router.post('/', createMessage);
router.delete('/:id', authenticate, requireAdmin, deleteMessage);

module.exports = router;
