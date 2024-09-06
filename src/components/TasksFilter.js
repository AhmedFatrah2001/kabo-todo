import React, { useState, useEffect } from 'react';
import { FaCog } from 'react-icons/fa';

const TasksFilter = ({ setFilteredTasks }) => {
  const [client, setClient] = useState('');
  const [responsibleUser, setResponsibleUser] = useState('');
  const [importanceLevel, setImportanceLevel] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [clientEnabled, setClientEnabled] = useState(false);
  const [responsibleUserEnabled, setResponsibleUserEnabled] = useState(false);
  const [importanceLevelEnabled, setImportanceLevelEnabled] = useState(false);
  const [startDateEnabled, setStartDateEnabled] = useState(false);
  const [endDateEnabled, setEndDateEnabled] = useState(false);
  const [statusEnabled, setStatusEnabled] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/dashboard/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5000/dashboard/clients');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchFilteredTasks = async () => {
    let query = 'http://localhost:5000/dashboard/tasks/filter?';

    if (clientEnabled && client) {
      query += `client=${encodeURIComponent(client)}&`;
    }
    if (responsibleUserEnabled && responsibleUser) {
      query += `responsible_user_id=${encodeURIComponent(responsibleUser)}&`;
    }
    if (importanceLevelEnabled) {
      query += `importance_level=${encodeURIComponent(importanceLevel)}&`;
    }
    if (startDateEnabled && startDate) {
      query += `start_date=${encodeURIComponent(startDate)}&`;
    }
    if (endDateEnabled && endDate) {
      query += `end_date=${encodeURIComponent(endDate)}&`;
    }
    if (statusEnabled && status) {
      query += `status=${encodeURIComponent(status)}&`;
    }

    try {
      const response = await fetch(query);
      const data = await response.json();
      setFilteredTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchClients();
  }, []);

  return (
    <div>
      <button
        onClick={() => setIsFilterVisible(!isFilterVisible)}
        className="flex items-center bg-gray-200 p-2 rounded-full mb-4"
      >
        <FaCog className="text-gray-700" />
          -Add filters
      </button>

      {isFilterVisible && (
        <div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={clientEnabled}
              onChange={() => setClientEnabled(!clientEnabled)}
              className="mr-2"
            />
            <label>Enable Client Filter</label>
          </div>
          {clientEnabled && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Client Name
              </label>
              <select
                name="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.client_name} value={client.client_name}>
                    {client.client_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={responsibleUserEnabled}
              onChange={() => setResponsibleUserEnabled(!responsibleUserEnabled)}
              className="mr-2"
            />
            <label>Enable Responsible User Filter</label>
          </div>
          {responsibleUserEnabled && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Responsible User
              </label>
              <select
                value={responsibleUser}
                onChange={(e) => setResponsibleUser(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={importanceLevelEnabled}
              onChange={() => setImportanceLevelEnabled(!importanceLevelEnabled)}
              className="mr-2"
            />
            <label>Enable Importance Level Filter</label>
          </div>
          {importanceLevelEnabled && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Importance Level
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="10"
                value={importanceLevel}
                onChange={(e) => setImportanceLevel(e.target.value)}
                className="block w-full"
              />
              <span className="text-center block">{importanceLevel}</span>
            </div>
          )}

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={startDateEnabled}
              onChange={() => setStartDateEnabled(!startDateEnabled)}
              className="mr-2"
            />
            <label>Enable Start Date Filter</label>
          </div>
          {startDateEnabled && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={endDateEnabled}
              onChange={() => setEndDateEnabled(!endDateEnabled)}
              className="mr-2"
            />
            <label>Enable End Date Filter</label>
          </div>
          {endDateEnabled && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={statusEnabled}
              onChange={() => setStatusEnabled(!statusEnabled)}
              className="mr-2"
            />
            <label>Enable Status Filter</label>
          </div>
          {statusEnabled && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select status</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Standby">Standby</option>
                <option value="Modification">Modification</option>
              </select>
            </div>
          )}

          <button
            onClick={fetchFilteredTasks}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default TasksFilter;
