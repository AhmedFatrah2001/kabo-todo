const pool = require('../db');

// Create a client
exports.createClient = async (req, res) => {
  const { client_name, description } = req.body;

  try {
    await pool.query('INSERT INTO clients (client_name, description) VALUES (?, ?)', [client_name, description]);
    res.status(201).json({ message: 'Client created successfully' });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clients');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get a client by name
exports.getClientByName = async (req, res) => {
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
};

// Update a client
exports.updateClient = async (req, res) => {
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
};

// Delete a client
exports.deleteClient = async (req, res) => {
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
};
