const pool = require('../db');

// Create a task
exports.createTask = async (req, res) => {
  const { client, responsible_user_id, task, description, importance_level, start_date, end_date, status } = req.body;

  try {
    await pool.query(
      'INSERT INTO tasks (client, responsible_user_id, task, description, importance_level, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [client, responsible_user_id, task, description, importance_level, start_date, end_date, status]
    );
    res.status(201).json({ message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Filter tasks
exports.filterTasks = async (req, res) => {
  const { client, responsible_user_id, importance_level, start_date, end_date, status, is_validated } = req.query;

  let query = 'SELECT * FROM tasks WHERE 1=1';
  const queryParams = [];

  if (client) {
    query += ' AND client LIKE ?';
    queryParams.push(`%${client}%`);
  }
  if (responsible_user_id) {
    query += ' AND responsible_user_id = ?';
    queryParams.push(responsible_user_id);
  }
  if (importance_level) {
    query += ' AND importance_level = ?';
    queryParams.push(importance_level);
  }
  if (start_date) {
    query += ' AND start_date >= ?';
    queryParams.push(start_date);
  }
  if (end_date) {
    query += ' AND end_date <= ?';
    queryParams.push(end_date);
  }
  if (status) {
    query += ' AND status = ?';
    queryParams.push(status);
  }
  if (is_validated) {
    query += ' AND is_validated = ?';
    queryParams.push(is_validated === 'true' ? 1 : 0);
  }

  try {
    const [results] = await pool.query(query, queryParams);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error filtering tasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update a task by ID
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { client, responsible_user_id, task, description, importance_level, start_date, end_date, status } = req.body;

  let query = 'UPDATE tasks SET';
  const queryParams = [];
  const fieldsToUpdate = [];

  if (client) {
    fieldsToUpdate.push(' client = ?');
    queryParams.push(client);
  }
  if (responsible_user_id) {
    fieldsToUpdate.push(' responsible_user_id = ?');
    queryParams.push(responsible_user_id);
  }
  if (task) {
    fieldsToUpdate.push(' task = ?');
    queryParams.push(task);
  }
  if (description) {
    fieldsToUpdate.push(' description = ?');
    queryParams.push(description);
  }
  if (importance_level) {
    fieldsToUpdate.push(' importance_level = ?');
    queryParams.push(importance_level);
  }
  if (start_date) {
    fieldsToUpdate.push(' start_date = ?');
    queryParams.push(start_date);
  }
  if (end_date) {
    fieldsToUpdate.push(' end_date = ?');
    queryParams.push(end_date);
  }
  if (status) {
    fieldsToUpdate.push(' status = ?');
    queryParams.push(status);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  query += fieldsToUpdate.join(', ') + ' WHERE id = ?';
  queryParams.push(id);

  try {
    const [result] = await pool.query(query, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a task by ID
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get a task by ID
exports.getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
