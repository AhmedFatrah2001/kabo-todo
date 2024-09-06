import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ client_name: '', description: '' });
  const [editClient, setEditClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(5);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/dashboard/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('http://localhost:5000/dashboard/clients', newClient);
      setNewClient({ client_name: '', description: '' });
      fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/dashboard/clients/${editClient.client_name}`, { description: editClient.description });
      setEditClient(null);
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/dashboard/clients/${confirmDelete}`);
        setConfirmDelete(null);
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const filteredClients = clients.filter(client =>
    client.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">Client Management</h3>
      <div className="mb-4 p-4 border rounded shadow">
        <input
          type="text"
          placeholder="Search by client name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>

      <div className="flex space-x-6">
        <div className="flex-1 p-4 border rounded shadow">
          <h6 className="text-xl font-semibold mb-2">{editClient ? 'Edit Client' : 'Add New Client'}</h6>
          <input
            type="text"
            placeholder="Client Name"
            value={editClient ? editClient.client_name : newClient.client_name}
            onChange={(e) => editClient ? setEditClient({ ...editClient, client_name: e.target.value }) : setNewClient({ ...newClient, client_name: e.target.value })}
            className="p-2 border rounded mb-2 w-full"
            disabled={editClient}
          />
          <textarea
            placeholder="Description"
            value={editClient ? editClient.description : newClient.description}
            onChange={(e) => editClient ? setEditClient({ ...editClient, description: e.target.value }) : setNewClient({ ...newClient, description: e.target.value })}
            className="p-2 border rounded mb-2 w-full"
          />
          {editClient ? (
            <div>
              <button onClick={handleUpdate} className="px-4 py-2 bg-yellow-500 text-white rounded mr-2">Update Client</button>
              <button onClick={() => setEditClient(null)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
            </div>
          ) : (
            <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 text-white rounded">Add Client</button>
          )}
        </div>

        <div className="flex-1 p-4 border rounded shadow">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4 text-left">Client Name</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentClients.map(client => (
                <tr key={client.client_name} className="border-b">
                  <td className="p-4">{client.client_name}</td>
                  <td className="p-4">{client.description}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setEditClient(client)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(client.client_name)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 mx-4 my-6 relative">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete the client "{confirmDelete}"?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded mr-2"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
