const pool = require('../db');
const multer = require('multer');

// Configure multer for file upload (store in memory to upload to DB)
const upload = multer({ storage: multer.memoryStorage() }).single('profile_picture');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, isAdmin, password, created_at, profile_picture FROM users');
    // Send profile_picture as base64 string if present
    res.status(200).json(
      rows.map((row) => ({
        ...row,
        profile_picture: row.profile_picture ? row.profile_picture.toString('base64') : null,
      }))
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// get user by id 
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, username, isAdmin, password, created_at, profile_picture FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = rows[0];
    res.status(200).json({
      ...user,
      profile_picture: user.profile_picture ? user.profile_picture.toString('base64') : null,
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Delete a user by ID
exports.deleteUser = async (req, res) => {
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
};

// Update a user by ID (with profile picture upload)
exports.updateUser = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading file' });
    }

    const { id } = req.params;
    const { username, password } = req.body;
    const profile_picture = req.file ? req.file.buffer : null; // Access the image file as a buffer

    try {
      const [rows] = await pool.query('SELECT isAdmin FROM users WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (rows[0].isAdmin) {
        return res.status(403).json({ message: 'Cannot modify admin user' });
      }

      // Update user with or without the profile picture
      const updateQuery = profile_picture
        ? 'UPDATE users SET username = ?, password = ?, profile_picture = ? WHERE id = ?'
        : 'UPDATE users SET username = ?, password = ? WHERE id = ?';

      const queryParams = profile_picture
        ? [username, password, profile_picture, id]
        : [username, password, id];

      await pool.query(updateQuery, queryParams);
      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
};
