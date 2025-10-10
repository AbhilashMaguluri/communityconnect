const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getDashboardStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(protect, authorize('admin'));

router.get('/', getAllUsers);
router.get('/dashboard-stats', getDashboardStats);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;