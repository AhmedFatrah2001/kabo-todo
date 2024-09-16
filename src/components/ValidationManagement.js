import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ValidationManagement = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [validatedTasks, setValidatedTasks] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const [currentPageCompleted, setCurrentPageCompleted] = useState(1);
  const [currentPageValidated, setCurrentPageValidated] = useState(1);
  const tasksPerPage = 6;

  const showNotification = (msg, type) => {
    setNotification({ message: msg, type, visible: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', visible: false });
    }, 3000);
  };

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/dashboard/tasks?status=Completed');
        const tasks = await response.json();
        const completed = tasks.filter(task => task.status === 'Completed' && !task.is_validated);
        setCompletedTasks(completed);
      } catch (error) {
        console.error('Error fetching completed tasks:', error);
      }
    };

    const fetchValidatedTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/dashboard/validated');
        const tasks = await response.json();
        setValidatedTasks(tasks);
      } catch (error) {
        console.error('Error fetching validated tasks:', error);
      }
    };

    fetchCompletedTasks();
    fetchValidatedTasks();
  }, []);

  const handleValidate = async (taskId) => {
    if (!window.confirm('Are you sure you want to validate this task?')) return;
    try {
      const response = await fetch(`http://localhost:5000/dashboard/validation/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_validated: true }),
      });

      if (response.ok) {
        showNotification('Task validated successfully!', 'success');
        const validatedTask = completedTasks.find(task => task.id === taskId);
        setCompletedTasks(completedTasks.filter(task => task.id !== taskId));
        setValidatedTasks([...validatedTasks, { ...validatedTask, is_validated: true }]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        showNotification('Failed to validate task.', 'error');
      }
    } catch (error) {
      console.error('Error validating task:', error);
      showNotification('Error validating task.', 'error');
    }
  };

  const handleRollback = async (taskId) => {
    if (!window.confirm('Are you sure you want to roll back this task?')) return;
    try {
      const response = await fetch(`http://localhost:5000/dashboard/validation/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_validated: false }),
      });

      if (response.ok) {
        showNotification('Validation rolled back successfully!', 'success');
        const rolledBackTask = validatedTasks.find(task => task.id === taskId);
        setValidatedTasks(validatedTasks.filter(task => task.id !== taskId));
        setCompletedTasks([...completedTasks, { ...rolledBackTask, is_validated: false }]);
      } else {
        showNotification('Failed to rollback validation.', 'error');
      }
    } catch (error) {
      console.error('Error rolling back validation:', error);
      showNotification('Error rolling back validation.', 'error');
    }
  };

  // Pagination Logic
  const indexOfLastCompletedTask = currentPageCompleted * tasksPerPage;
  const indexOfFirstCompletedTask = indexOfLastCompletedTask - tasksPerPage;
  const currentCompletedTasks = completedTasks.slice(indexOfFirstCompletedTask, indexOfLastCompletedTask);

  const indexOfLastValidatedTask = currentPageValidated * tasksPerPage;
  const indexOfFirstValidatedTask = indexOfLastValidatedTask - tasksPerPage;
  const currentValidatedTasks = validatedTasks.slice(indexOfFirstValidatedTask, indexOfLastValidatedTask);

  const totalPagesCompleted = Math.ceil(completedTasks.length / tasksPerPage);
  const totalPagesValidated = Math.ceil(validatedTasks.length / tasksPerPage);

  const paginateCompleted = (pageNumber) => setCurrentPageCompleted(pageNumber);
  const paginateValidated = (pageNumber) => setCurrentPageValidated(pageNumber);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Validation Management</h1>

      {notification.visible && (
        <div className={`fixed top-4 right-4 p-4 rounded shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </div>
      )}

      {showConfetti && <Confetti />}

      {/* Completed Tasks Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Completed Tasks</h2>
        {currentCompletedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCompletedTasks.map(task => (
              <div key={task.id} className="bg-white shadow-md rounded p-4 border border-gray-200">
                <h3 className="text-lg font-semibold">{task.task}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="mt-4 flex justify-between">
                  <button
                    className="text-green-600 hover:text-green-800"
                    onClick={() => handleValidate(task.id)}
                  >
                    <FaCheck /> Validate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No completed tasks! 🎉</p>
        )}
        {/* Pagination for Completed Tasks */}
        {completedTasks.length > tasksPerPage && (
          <div className="flex justify-center mt-4">
            {[...Array(totalPagesCompleted)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginateCompleted(index + 1)}
                className={`px-4 py-2 mx-1 rounded ${currentPageCompleted === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              >        {/* Pagination for Validated Tasks */}
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Validated Tasks Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Validated Tasks</h2>
        {currentValidatedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentValidatedTasks.map(task => (
              <div key={task.id} className="bg-white shadow-md rounded p-4 border border-gray-200">
                <h3 className="text-lg font-semibold">{task.task}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="mt-4 flex justify-between">
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleRollback(task.id)}
                  >
                    <FaTimes /> Rollback
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No validated tasks yet.</p>
        )}
        {validatedTasks.length > tasksPerPage && (
          <div className="flex justify-center mt-4">
            {[...Array(totalPagesValidated)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginateValidated(index + 1)}
                className={`px-4 py-2 mx-1 rounded ${currentPageValidated === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ValidationManagement;
