
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
const fetch = require('node-fetch');

const clientRoutes = require('./routes/clientRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const validationRoutes = require('./routes/validationRoutes');
const notificationRoutes = require('./routes/notificationRoutes')

const axios = require('axios');
const cheerio = require('cheerio');

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

app.use(clientRoutes);
app.use(userRoutes);
app.use(taskRoutes);
app.use(commentsRoutes);
app.use(validationRoutes);
app.use(notificationRoutes)

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


//user performance
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

//assets extract
// List of known media formats
const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.mp4', '.webm', '.ogg', '.mp3', '.wav', '.mov'];

// Utility function to check if a URL has a media format
const isMediaAsset = (url) => {
  return mediaExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

// Utility function to extract media assets from a page
const extractMediaAssets = (html, baseUrl) => {
  const $ = cheerio.load(html);
  const mediaAssets = [];

  // Extract images (img tags)
  $('img').each((_, element) => {
    const src = $(element).attr('src');
    if (src && isMediaAsset(src)) {
      mediaAssets.push(new URL(src, baseUrl).href);
    }
  });

  // Extract videos (video and source tags)
  $('video source').each((_, element) => {
    const src = $(element).attr('src');
    if (src && isMediaAsset(src)) {
      mediaAssets.push(new URL(src, baseUrl).href);
    }
  });
  $('video').each((_, element) => {
    const src = $(element).attr('src');
    if (src && isMediaAsset(src)) {
      mediaAssets.push(new URL(src, baseUrl).href);
    }
  });

  // Extract audio files (audio and source tags)
  $('audio source').each((_, element) => {
    const src = $(element).attr('src');
    if (src && isMediaAsset(src)) {
      mediaAssets.push(new URL(src, baseUrl).href);
    }
  });
  $('audio').each((_, element) => {
    const src = $(element).attr('src');
    if (src && isMediaAsset(src)) {
      mediaAssets.push(new URL(src, baseUrl).href);
    }
  });

  return mediaAssets;
};

// Endpoint to fetch media assets
app.get('/fetch-media-assets', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Please provide a URL' });
  }

  try {
    // Fetch the webpage
    const response = await axios.get(url);
    const html = response.data;

    // Extract media assets
    const mediaAssets = extractMediaAssets(html, url);

    // Return the media assets as JSON
    res.json({ mediaAssets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch the webpage' });
  }
});


//color picker 
app.post('/color-picker', async (req, res) => {
  const colormindUrl = 'http://colormind.io/api/';
  
  try {
      const response = await fetch(colormindUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body), 
      });

      if (!response.ok) {
          return res.status(response.status).json({ message: 'Failed to fetch color palette' });
      }

      const palette = await response.json();
      res.json(palette);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching color palette', error: error.message });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
