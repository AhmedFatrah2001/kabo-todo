
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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
app.use('/uploads', express.static('uploads'));


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
app.put('/dashboard/validation/:taskid', async (req, res) => {
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
});
app.get('/dashboard/validated', async (req, res) => {
  try {
    const query = 'SELECT * FROM tasks WHERE is_validated = 1';
    const [results] = await pool.query(query);
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching validated tasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/user-performance/:id', async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT tasks_validated, early_tasks, late_tasks, early_hours, late_hours, score
    FROM user_performance
    WHERE user_id = ?
  `;

  try {
    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User performance not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching user performance:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/dashboard/notifications/:userid', async (req, res) => {
  const { userid } = req.params;

  try {
    const query = 'SELECT * FROM notifications WHERE user_id = ?';
    const [results] = await pool.query(query, [userid]);

    // Return an empty set if no notifications are found
    if (results.length === 0) {
      return res.status(200).json([]); // Return an empty array
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/dashboard/notifications/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM notifications WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/dashboard/notifications/mark-read/:userid', async (req, res) => {
  const { userid } = req.params;

  try {
    const query = 'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0';
    const [result] = await pool.query(query, [userid]);

    if (result.affectedRows === 0) {
      return res.status(200).json({ message: 'No unread notifications to mark as read' });
    }

    res.status(200).json({ message: 'All unread notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//File uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage: storage });

app.post('/dashboard/upload', upload.single('file'), async (req, res) => {
  const { uploader_id, allowed_users } = req.body;
  const filepath = `/uploads/${req.file.originalname}`;

  const allowedUsers = JSON.parse(allowed_users);

  try {
    // Insert file info into the 'files' table
    const [result] = await pool.query(
      'INSERT INTO files (filename, uploader_id, filepath, created_at) VALUES (?, ?, ?, NOW())',
      [req.file.originalname, uploader_id, filepath]
    );

    const fileId = result.insertId;

    // Automatically add uploader to allowed users
    if (!allowedUsers.includes(parseInt(uploader_id))) {
      allowedUsers.push(parseInt(uploader_id));
    }

    // Insert each allowed user into the 'file_permissions' table
    const permissionQueries = allowedUsers.map(userId => {
      return pool.query(
        'INSERT INTO file_permissions (file_id, user_id) VALUES (?, ?)',
        [fileId, userId]
      );
    });

    await Promise.all(permissionQueries);

    // Respond with success and newly uploaded file info
    res.status(200).json({ 
      message: 'File uploaded and permissions assigned successfully!', 
      file: {
        id: fileId,
        filename: req.file.originalname,
        filepath: filepath
      }
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).send({ message: 'File upload failed!', error: err });
  }
});


// Fetch files for the current user
app.get('/dashboard/files/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT f.id, f.filename, f.filepath, f.uploader_id, f.created_at
      FROM files f
      INNER JOIN file_permissions fp ON f.id = fp.file_id
      WHERE fp.user_id = ?
    `;
    const [files] = await pool.query(query, [userId]);

    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.delete('/dashboard/file/:id', async (req, res) => {
  const fileId = req.params.id;
  
  try {
    const [file] = await pool.query('SELECT filepath FROM files WHERE id = ?', [fileId]);
    if (!file.length) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filepath = `./${file[0].filepath}`;
    fs.unlinkSync(filepath);  // Deletes file from local storage

    await pool.query('DELETE FROM files WHERE id = ?', [fileId]);
    res.status(200).json({ message: 'File deleted successfully!' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/dashboard/files/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const query = `
      SELECT f.id, f.filename, f.filepath 
      FROM files f
      JOIN file_permissions fp ON f.id = fp.file_id
      WHERE fp.user_id = ?
    `;
    const [results] = await pool.query(query, [userId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  
  res.download(filepath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).send('File not found.');
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
