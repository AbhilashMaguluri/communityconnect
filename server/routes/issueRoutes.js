const express = require('express');
const {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  voteOnIssue,
  addComment,
  getMyIssues,
  getIssueStats,
  getTrendingIssues
} = require('../controllers/issueController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { validateIssue, validateIssueUpdate, validateComment } = require('../middleware/validators');
const { upload, handleMulterErrors } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllIssues);
router.get('/stats', getIssueStats);
router.get('/analytics/trending', optionalAuth, getTrendingIssues);
router.get('/:id', getIssueById);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/', 
  upload.array('images', 5), 
  handleMulterErrors,
  validateIssue, 
  handleValidationErrors, 
  createIssue
);

router.get('/user/my-issues', getMyIssues);
router.post('/:id/vote', voteOnIssue);
router.post('/:id/comment', validateComment, handleValidationErrors, addComment);

// Admin only routes
router.put('/:id', authorize('admin'), validateIssueUpdate, handleValidationErrors, updateIssue);
router.delete('/:id', deleteIssue); // Both admin and issue reporter can delete

module.exports = router;