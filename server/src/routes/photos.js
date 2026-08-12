const express = require('express');
const router = express.Router();
const { getPhotos, createPhoto, deletePhoto } = require('../controllers/photoController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', getPhotos);
router.post('/', authenticate, requireAdmin, createPhoto);
router.delete('/:id', authenticate, requireAdmin, deletePhoto);

module.exports = router;
