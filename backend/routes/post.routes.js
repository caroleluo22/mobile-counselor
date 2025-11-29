const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');

// Middleware to ensure user is authenticated
const ensureAuth = (req, res, next) => (req.isAuthenticated() ? next() : res.status(401).json({ message: 'Unauthorized' }));

router.get('/', postController.listPosts);
router.post('/', ensureAuth, postController.createPost);
router.post('/:postId/replies', ensureAuth, postController.addReply);
router.patch('/:postId/ai-reply', ensureAuth, postController.updatePostWithAIReply);

module.exports = router;