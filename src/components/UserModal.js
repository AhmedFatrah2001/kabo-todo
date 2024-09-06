import React, { useState, useEffect } from 'react';

const UserModal = ({ user, onClose }) => {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState(user.password);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    if (isDeleteModalOpen) {
      setConfirmationCode(Math.floor(1000 + Math.random() * 9000).toString());
    }
  }, [isDeleteModalOpen]);

  const handleSave = async () => {
    if (!username) {
      setError('Username is required');
      return;
    }
  
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/dashboard/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
  
      if (response.ok) {
        console.log('User information updated');
        onClose();
      } else {
        console.error('Failed to update user');
        setError('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Internal Server Error');
    }
  };
  

  const handleDelete = async () => {
    if (inputCode === confirmationCode) {
      try {
        const response = await fetch(`http://localhost:5000/dashboard/users/${user.id}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          console.log('User deleted');
          setIsDeleteModalOpen(false);
          onClose();
        } else {
          console.error('Failed to delete user');
          setError('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
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
          <h2 className="text-2xl font-bold mb-4">Edit User</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
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

export default UserModal;
