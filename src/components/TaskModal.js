import React, { useState, useEffect } from 'react';

const TaskModal = ({ task, users, onClose, fetchTasks }) => {
  const [client, setClient] = useState(task.client || '');
  const [responsibleUserId, setResponsibleUserId] = useState(task.responsible_user_id || '');
  const [taskTitle, setTaskTitle] = useState(task.task || '');
  const [description, setDescription] = useState(task.description || '');
  const [importanceLevel, setImportanceLevel] = useState(task.importance_level || 10);
  const [startDate, setStartDate] = useState(task.start_date || '');
  const [endDate, setEndDate] = useState(task.end_date || '');
  const [status, setStatus] = useState(task.status || 'In Progress');
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (isDeleteModalOpen) {
      setConfirmationCode(Math.floor(1000 + Math.random() * 9000).toString());
    }
  }, [isDeleteModalOpen]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('http://localhost:5000/dashboard/clients');
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const handleSave = async () => {
    if (!client || !taskTitle || !description || !startDate || !endDate) {
      setError('All fields except "Status" are required.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after the start date.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/dashboard/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client,
          responsible_user_id: responsibleUserId,
          task: taskTitle,
          description,
          importance_level: importanceLevel,
          start_date: startDate,
          end_date: endDate,
          status,
        }),
      });

      if (response.ok) {
        console.log('Task information updated');
        fetchTasks();
        onClose();
      } else {
        console.error('Failed to update task');
        setError('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Internal Server Error');
    }
  };

  const handleDelete = async () => {
    if (inputCode === confirmationCode) {
      try {
        const response = await fetch(`http://localhost:5000/dashboard/tasks/${task.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('Task deleted');
          setIsDeleteModalOpen(false);
          fetchTasks(); 
          onClose();
        } else {
          console.error('Failed to delete task');
          setError('Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Internal Server Error');
      }
    } else {
      setError('Invalid confirmation code');
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {/* Client Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.client_name} value={client.client_name}>
                  {client.client_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Responsible User</label>
            <select
              value={responsibleUserId}
              onChange={(e) => setResponsibleUserId(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Task Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Importance Level</label>
            <input
              type="range"
              min="10"
              max="50"
              step="10"
              value={importanceLevel}
              onChange={(e) => setImportanceLevel(e.target.value)}
              className="block w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Standby">Standby</option>
              <option value="Modification">Modification</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Please enter the following code to confirm deletion:
            </p>
            <p className="font-bold text-lg mb-4">{confirmationCode}</p>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex justify-between mt-6">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskModal;
