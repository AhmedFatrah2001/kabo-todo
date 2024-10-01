const pool = require('../db');

// Get notifications by user ID
exports.getNotificationsByUser = async (req, res) => {
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
};

// Delete a notification by ID
exports.deleteNotification = async (req, res) => {
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
};

// Mark all unread notifications as read for a user
exports.markNotificationsAsRead = async (req, res) => {
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
};
