const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboard } = require('../controllers/ownerController');

// All owner routes require authentication + STORE_OWNER role
router.use(authenticate, authorize('STORE_OWNER'));

router.get('/dashboard', getDashboard);

module.exports = router;
