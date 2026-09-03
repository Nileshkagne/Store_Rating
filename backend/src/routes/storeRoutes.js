const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getStores, submitRating, modifyRating } = require('../controllers/storeController');

// All store routes require authentication + NORMAL_USER role
router.use(authenticate, authorize('NORMAL_USER'));

router.get('/', getStores);
router.post('/:id/rating', submitRating);
router.put('/:id/rating', modifyRating);

module.exports = router;
