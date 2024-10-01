const express = require('express');
const clientController = require('../controllers/clientController');
const router = express.Router();

router.post('/dashboard/clients', clientController.createClient);
router.get('/dashboard/clients', clientController.getClients);
router.get('/dashboard/clients/:client_name', clientController.getClientByName);
router.put('/dashboard/clients/:client_name', clientController.updateClient);
router.delete('/dashboard/clients/:client_name', clientController.deleteClient);

module.exports = router;
