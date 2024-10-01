const pool = require('../db');

// Update task validation by task ID
exports.updateTaskValidation = async (req, res) => {
  const { taskid } = req.params;
  const { is_validated } = req.body;

  if (typeof is_validated !== 'boolean') {
    return res.status(400).json({ message: 'is_validated must be a boolean value' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE tasks SET is_validated = ? WHERE id = ?',
      [is_validated, taskid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: `Task ${is_validated ? 'validated' : 'validation removed'} successfully!` });
  } catch (error) {
    console.error('Error updating task validation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all validated tasks
exports.getValidatedTasks = async (req, res) => {
  try {
    const query = 'SELECT * FROM tasks WHERE is_validated = 1';
    const [results] = await pool.query(query);
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching validated tasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
