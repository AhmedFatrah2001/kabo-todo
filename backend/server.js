
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'kabo1todo@gmail.com',
    pass: 'fvdl ufyy wvqt ztbq',
  },
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length > 0 && rows[0].password === password) {
      const token = jwt.sign(
        {
          id: rows[0].id,
          username: rows[0].username,
          isAdmin: rows[0].isAdmin,
          timestamp: new Date().toISOString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.json({
        id: rows[0].id,
        username: rows[0].username,
        isAdmin: rows[0].isAdmin,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/dashboard/register', async (req, res) => {
  const { username, password, isAdmin, email } = req.body;
  
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE isAdmin = true');

    if (rows.length > 0) {
      await pool.query('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', [username, password, isAdmin]);
      res.status(201).json({ message: 'User created successfully' });
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
    if (email) {
      const mailOptions = {
        from: 'kabo1todo@gmail.com',
        to: email,
        subject: 'Welcome to Our Platform',
        text: `Hello ${username},\n\nThank you for registering on our platform.\n\nBest regards,\nKabo team`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/dashboard/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, isAdmin, password, created_at FROM users');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.delete('/dashboard/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if the user is an admin
    const [rows] = await pool.query('SELECT isAdmin FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (rows[0].isAdmin) {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.put('/dashboard/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT isAdmin FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (rows[0].isAdmin) {
      return res.status(403).json({ message: 'Cannot modify admin user' });
    }
    await pool.query('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, password, id]);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post('/dashboard/tasks', async (req, res) => {
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
});
app.get('/dashboard/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/dashboard/tasks/filter', async (req, res) => {
  const { client, responsible_user_id, importance_level, start_date, end_date, status } = req.query;

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

  try {
    const [results] = await pool.query(query, queryParams);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error filtering tasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.put('/dashboard/tasks/:id', async (req, res) => {
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
});

app.delete('/dashboard/tasks/:id', async (req, res) => {
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
});
app.get('/dashboard/tasks/:id', async (req, res) => {
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
});
//Clients
app.post('/dashboard/clients', async (req, res) => {
  const { client_name, description } = req.body;
  
  try {
    await pool.query('INSERT INTO clients (client_name, description) VALUES (?, ?)', [client_name, description]);
    res.status(201).json({ message: 'Client created successfully' });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/dashboard/clients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clients');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/dashboard/clients/:client_name', async (req, res) => {
  const { client_name } = req.params;
  
  try {
    const [rows] = await pool.query('SELECT * FROM clients WHERE client_name = ?', [client_name]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.put('/dashboard/clients/:client_name', async (req, res) => {
  const { client_name } = req.params;
  const { description } = req.body;
  
  try {
    const [result] = await pool.query(
      'UPDATE clients SET description = ? WHERE client_name = ?',
      [description, client_name]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.delete('/dashboard/clients/:client_name', async (req, res) => {
  const { client_name } = req.params;
  
  try {
    const [result] = await pool.query('DELETE FROM clients WHERE client_name = ?', [client_name]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
//comments
app.post('/dashboard/comments', async (req, res) => {
  const { task_id, user_id, comment } = req.body;
  try {
      const newComment = await pool.query(
          'INSERT INTO comments (task_id, user_id, comment, created_at) VALUES (?, ?, ?, NOW())',
          [task_id, user_id, comment]
      );
      res.json({ message: 'Comment added successfully', comment: newComment.insertId });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
  }
});

// Get comments by task
app.get('/dashboard/comments/:task_id', async (req, res) => {
  const { task_id } = req.params;
  try {
    const [comments] = await pool.query(
      'SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.task_id = ? ORDER BY c.created_at DESC',
      [task_id]
    );
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a comment
app.delete('/dashboard/comments/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await pool.query('DELETE FROM comments WHERE id = ?', [id]);
      res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
