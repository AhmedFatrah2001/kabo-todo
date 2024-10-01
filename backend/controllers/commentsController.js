const pool = require('../db');

// Add a new comment
exports.addComment = async (req, res) => {
  const { task_id, user_id, comment } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO comments (task_id, user_id, comment, created_at) VALUES (?, ?, ?, NOW())',
      [task_id, user_id, comment]
    );
    res.status(201).json({ message: 'Comment added successfully', commentId: result.insertId });
  } catch (err) {
    console.error('Error adding comment:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get comments by task ID
exports.getCommentsByTask = async (req, res) => {
  const { task_id } = req.params;

  try {
    const [comments] = await pool.query(
      'SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.task_id = ? ORDER BY c.created_at DESC',
      [task_id]
    );
    res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a comment by ID
exports.deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM comments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
