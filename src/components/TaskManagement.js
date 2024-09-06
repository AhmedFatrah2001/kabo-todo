import React, { useState, useEffect } from "react";
import TaskModal from "./TaskModal";
import { FaStar } from "react-icons/fa";
import TasksFilter from "./TasksFilter";

const TaskManagement = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [clients, setClients] = useState([]);

  const [taskData, setTaskData] = useState({
    client: "",
    responsible_user_id: "",
    task: "",
    description: "",
    importance_level: 10,
    start_date: "",
    end_date: "",
    status: "In Progress",
  });
  const [errors, setErrors] = useState({});

  const handleRowClick = (task) => {
    setSelectedTask(task);
  };
  const handleSetFilteredTasks = (newTasks) => {
    setTasks(newTasks);
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/dashboard/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/dashboard/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.task.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:5000/dashboard/clients");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchClients();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!taskData.client) newErrors.client = "Client name is required.";
    if (!taskData.responsible_user_id)
      newErrors.responsible_user_id = "Responsible user is required.";
    if (!taskData.task) newErrors.task = "Task title is required.";
    if (!taskData.description)
      newErrors.description = "Task description is required.";
    if (!taskData.start_date) newErrors.start_date = "Start date is required.";
    if (!taskData.end_date) newErrors.end_date = "End date is required.";
    if (new Date(taskData.start_date) > new Date(taskData.end_date))
      newErrors.end_date = "End date must be after the start date.";
    return newErrors;
  };

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    try {
      const response = await fetch("http://localhost:5000/dashboard/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client: taskData.client,
          responsible_user_id: taskData.responsible_user_id,
          task: taskData.task,
          description: taskData.description,
          importance_level: taskData.importance_level,
          start_date: taskData.start_date,
          end_date: taskData.end_date,
          status: taskData.status,
        }),
      });
      if (response.ok) {
        console.log("Task saved successfully!");
        fetchTasks();
      } else {
        console.error("Failed to save task");
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const truncateText = (text, maxWords) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    return text;
  };

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 flex space-x-6">
      <div className="w-1/4">
        <h2 className="text-2xl font-bold mb-4">Add new task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <select
              name="client"
              value={taskData.client}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.client_name} value={client.client_name}>
                  {client.client_name}
                </option>
              ))}
            </select>
            {errors.client && (
              <p className="text-red-500 text-xs mt-1">{errors.client}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Responsible User
            </label>
            <select
              name="responsible_user_id"
              value={taskData.responsible_user_id}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            {errors.responsible_user_id && (
              <p className="text-red-500 text-xs mt-1">
                {errors.responsible_user_id}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Task Title
            </label>
            <input
              type="text"
              name="task"
              value={taskData.task}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.task && (
              <p className="text-red-500 text-xs mt-1">{errors.task}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Task Description
            </label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Importance Level
            </label>
            <input
              type="range"
              name="importance_level"
              min="10"
              max="50"
              step="10"
              value={taskData.importance_level}
              onChange={handleChange}
              className="block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Not Important</span>
              <span>Very Important</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={taskData.start_date}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.start_date && (
              <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={taskData.end_date}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.end_date && (
              <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={taskData.status}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Standby">Standby</option>
              <option value="Modification">Modification</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Save Task
          </button>
        </form>
      </div>
      <div className="w-3/4">
        <h2 className="text-2xl font-bold mb-4">Tasks</h2>
        <input
          type="text"
          placeholder="Search tasks"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <TasksFilter setFilteredTasks={handleSetFilteredTasks} />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border-b text-center">Client</th>
                <th className="p-2 border-b text-center">Responsible</th>
                <th className="p-2 border-b text-center">Task</th>
                <th className="p-2 border-b text-center">Description</th>
                <th className="p-2 border-b text-center">Importance Level</th>
                <th className="p-2 border-b text-center">Start Date</th>
                <th className="p-2 border-b text-center">End Date</th>
                <th className="p-2 border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => handleRowClick(task)}
                  className={`hover:bg-gray-100 cursor-pointer ${
                    new Date(task.end_date) < new Date()
                      ? "bg-red-400"
                      : new Date(task.end_date) <=
                        new Date(new Date().setDate(new Date().getDate() + 1))
                      ? "bg-orange-100"
                      : new Date(task.end_date) <=
                        new Date(new Date().setDate(new Date().getDate() + 3))
                      ? "bg-yellow-100"
                      : new Date(task.end_date) <=
                        new Date(new Date().setDate(new Date().getDate() + 7))
                      ? "bg-blue-100"
                      : ""
                  } ${
                    task.status === "Completed"
                      ? "border-4 border-green-400"
                      : ""
                  }`}
                >
                  <td className="p-2 border-b text-center">{task.client}</td>
                  <td className="p-2 border-b text-center">
                    {users.find((user) => user.id === task.responsible_user_id)
                      ?.username || "Unknown"}
                  </td>
                  <td className="p-2 border-b text-center">{task.task}</td>
                  <td
                    className="p-2 border-b text-center"
                    title={task.description}
                  >
                    {truncateText(task.description, 5)}
                  </td>
                  <td style={{ display: "flex", alignItems: "center" }}>
                    {Array.from({ length: 5 }, (v, i) => (
                      <FaStar
                        key={i}
                        color={
                          i < task.importance_level / 10 ? "#ffc107" : "#e4e5e9"
                        }
                        style={{ marginRight: "2px", marginTop: "8px" }}
                      />
                    ))}
                  </td>

                  <td
                    className="p-2 border-b text-center"
                    title={new Date(task.start_date).toLocaleDateString()}
                  >
                    {formatShortDate(task.start_date)}
                  </td>
                  <td
                    className="p-2 border-b text-center"
                    title={new Date(task.end_date).toLocaleDateString()}
                  >
                    {formatShortDate(task.end_date)}
                  </td>
                  <td
                    className={`p-2 border-b text-center ${
                      task.status === "In Progress"
                        ? "bg-yellow-200"
                        : task.status === "Standby"
                        ? "bg-blue-200"
                        : task.status === "Completed"
                        ? "bg-green-200"
                        : task.status === "Modification"
                        ? "bg-red-200"
                        : ""
                    }`}
                  >
                    {task.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              } py-2 px-4 rounded-md mr-2`}
            >
              {page}
            </button>
          ))}
        </div>
        <div className="bg-white p-4 rounded shadow-md mt-4 mx-auto">
          <h6 className="text-lg font-semibold mb-2">
            Task Deadline Color Map
          </h6>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100"></div>
              <span>More than 7 days left</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100"></div>
              <span>Between 3 and 7 days left</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-100"></div>
              <span>Between 1 and 3 days left</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-400"></div>
              <span>Task due or less than a day</span>
            </div>
          </div>
        </div>
      </div>
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          fetchTasks={fetchTasks}
        />
      )}
    </div>
  );
};

export default TaskManagement;
