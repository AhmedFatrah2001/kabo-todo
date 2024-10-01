const express = require('express');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

router.get('/dashboard/notifications/:userid', notificationController.getNotificationsByUser);
router.delete('/dashboard/notifications/:id', notificationController.deleteNotification);
router.put('/dashboard/notifications/mark-read/:userid', notificationController.markNotificationsAsRead);

module.exports = router;
