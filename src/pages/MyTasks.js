import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { FaCheckCircle, FaUserCheck, FaRegSmile } from "react-icons/fa";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const fetchTasks = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await fetch(
        `http://localhost:5000/dashboard/tasks/filter?responsible_user_id=${userId}`
      );
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    if (newStatus === "Completed") {
      const confirmed = window.confirm(
        "Are you sure you have completed this task?"
      );
      if (!confirmed) return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/dashboard/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );

        if (newStatus === "Completed") {
          triggerConfetti();
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const triggerConfetti = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 5000);
  };

  useEffect(() => {
    fetchTasks();

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeLeft = end - now;
    if (timeLeft < 0) {
      return "Time's up!";
    }
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  };

  return (
    <div className="p-6 bg-gray-50">
      {confetti && (
        <Confetti width={windowSize.width} height={windowSize.height} />
      )}
      <h1 className="text-4xl font-bold mb-6 text-gray-700">My Tasks</h1>
      
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaRegSmile className="text-6xl text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">
            You don't have any tasks yet!
          </h3>
          <p className="text-gray-500">
            Once you receive tasks, they will appear here. Sit tight!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg shadow-md border ${
                task.status === "Completed"
                  ? "bg-green-200"
                  : task.status === "In Progress"
                  ? "bg-yellow-100"
                  : task.status === "Standby"
                  ? "bg-blue-100"
                  : "bg-red-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{task.task}</h3>
                <div>
                  {task.status === "Completed" && (
                    <FaCheckCircle className="text-green-500 text-2xl" />
                  )}
                  {task.is_validated ? (
                    <FaUserCheck className="text-green-500 text-2xl" />
                  ) : null}
                </div>
              </div>
              <h6 className="text-sm text-gray-700">Client : {task.client}</h6>
              <p className="text-sm text-gray-700">
                Description : {task.description}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Time Left : {formatTimeLeft(task.end_date)}
              </p>
              <div className="mt-4">
                <select
                  className="block w-full p-2 border rounded-md"
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Standby">Standby</option>
                  <option value="Modification">Modification</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
