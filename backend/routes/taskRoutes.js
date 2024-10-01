const express = require('express');
const taskController = require('../controllers/taskController');
const router = express.Router();

router.post('/dashboard/tasks', taskController.createTask);
router.get('/dashboard/tasks', taskController.getTasks);
router.get('/dashboard/tasks/filter', taskController.filterTasks);
router.put('/dashboard/tasks/:id', taskController.updateTask);
router.delete('/dashboard/tasks/:id', taskController.deleteTask);
router.get('/dashboard/tasks/:id', taskController.getTaskById);

module.exports = router;
