const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboard, getUsers, createUser, getUserById, getStores, createStore } = require('../controllers/adminController');

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.get('/stores', getStores);
router.post('/stores', createStore);

module.exports = router;
