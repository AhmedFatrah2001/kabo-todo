const express = require('express');
const validationController = require('../controllers/validationController');
const router = express.Router();

router.put('/dashboard/validation/:taskid', validationController.updateTaskValidation);
router.get('/dashboard/validated', validationController.getValidatedTasks);

module.exports = router;
