const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Get all users (including profile pictures in base64 format)
router.get('/dashboard/users', userController.getUsers);

//one use by id
router.get('/dashboard/users/:id', userController.getUserById);


// Delete a user by ID
router.delete('/dashboard/users/:id', userController.deleteUser);

// Update user (including profile picture upload)
router.put('/dashboard/users/:id', userController.updateUser);

module.exports = router;
