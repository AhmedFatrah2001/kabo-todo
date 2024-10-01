const express = require('express');
const commentsController = require('../controllers/commentsController');
const router = express.Router();

router.post('/dashboard/comments', commentsController.addComment);
router.get('/dashboard/comments/:task_id', commentsController.getCommentsByTask);
router.delete('/dashboard/comments/:id', commentsController.deleteComment);

module.exports = router;
