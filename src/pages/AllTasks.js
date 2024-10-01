import React, { useState, useEffect } from "react";
import { FaStar, FaPlus, FaTimes, FaUserCheck } from "react-icons/fa";
import TasksFilter from "../components/TasksFilter";
import { FaRegCircleXmark } from "react-icons/fa6";

const AllTasks = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const loggedInUserId = localStorage.getItem("userId");

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

  const fetchComments = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/dashboard/comments/${taskId}`
      );
      const data = await response.json();
      setComments((prev) => ({ ...prev, [taskId]: data }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const toggleComments = (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
      if (!comments[taskId]) {
        fetchComments(taskId);
      }
    }
  };

  const handleRowClick = (task) => {
    toggleComments(task.id);
  };

  const handleSetFilteredTasks = (newTasks) => {
    setTasks(newTasks);
  };

  const handleAddCommentClick = () => {
    setIsAddingComment((prev) => !prev);
  };

  const handleAddCommentSubmit = async (taskId) => {
    if (newComment.trim() === "") return;
    try {
      const response = await fetch(`http://localhost:5000/dashboard/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: taskId,
          comment: newComment,
          user_id: loggedInUserId,
        }),
      });
      const newCommentData = await response.json();
      setComments((prev) => ({
        ...prev,
        [taskId]: [...prev[taskId], newCommentData],
      }));
      setNewComment("");
      setIsAddingComment(false);
      fetchComments(taskId);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (taskId, commentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:5000/dashboard/comments/${commentId}`, {
        method: "DELETE",
      });
      setComments((prev) => ({
        ...prev,
        [taskId]: prev[taskId].filter((comment) => comment.id !== commentId),
      }));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.task.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

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
    <div className="shadow-lg rounded-lg p-6 space-y-6">
      <div className="w-full">
      <h1 className="text-4xl font-bold mb-6 text-gray-700">All Tasks</h1>
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
                <th className="p-2 border-b text-center">Validation</th>
              </tr>
            </thead>
            <tbody>
              {currentTasks.map((task) => (
                <React.Fragment key={task.id}>
                  <tr
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
                    }${
                      task.status === "Completed"
                        ? " border-4 border-green-400"
                        : ""
                    }`}
                  >
                    <td className="p-2 border-b text-center">{task.client}</td>
                    <td className="p-2 border-b text-center">
                      {users.find(
                        (user) => user.id === task.responsible_user_id
                      )?.username || "Unknown"}
                    </td>
                    <td className="p-2 border-b text-center">{task.task}</td>
                    <td
                      className="p-2 border-b text-center"
                      title={task.description}
                    >
                      {truncateText(task.description, 5)}
                    </td>
                    <td className="p-2 border-b text-center">
                      <p className="flex justify-center">
                        {Array.from({ length: 5 }, (v, i) => (
                          <FaStar
                            key={i}
                            color={
                              i < task.importance_level / 10
                                ? "#ffc107"
                                : "#e4e5e9"
                            }
                            style={{ marginRight: "2px" }}
                          />
                        ))}
                      </p>
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
                    <td className="p-2 border-b text-center">{task.status}</td>
                    <td className="p-2 border-b text-center">{task.is_validated ? <FaUserCheck/>:<FaRegCircleXmark/>}</td>
                  </tr>
                  {expandedTaskId === task.id && (
                    <tr>
                      <td colSpan="8">
                        <div className="flex-auto bg-gray-100 p-4 rounded-md">
                          <h3 className="font-bold text-lg">Comments</h3>
                          <div className="flex space-x-6">
                            {comments[task.id]?.map((comment) => (
                              <div
                                key={comment.id} 
                                className="bg-white p-3 shadow-md rounded-md relative"
                              >
                                <div>
                                  <p className="text-sm font-bold">
                                    {
                                      users.find(
                                        (user) => user.id === comment.user_id
                                      )?.username
                                    }
                                  </p>
                                  <p>{comment.comment}</p>
                                  <span className="text-xs text-gray-400">
                                    {new Date(
                                      comment.created_at
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                {comment.user_id ===
                                  parseInt(loggedInUserId) && (
                                  <button
                                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                                    onClick={() =>
                                      handleDeleteComment(task.id, comment.id)
                                    }
                                  >
                                    <FaTimes />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {isAddingComment ? (
                            <div className="mt-4">
                              <textarea
                                placeholder="Add a comment"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                              <button
                                onClick={() => handleAddCommentSubmit(task.id)}
                                className="bg-indigo-500 text-white p-2 mt-2 rounded-md"
                              >
                                Add Comment
                              </button>
                            </div>
                          ) : (
                            <button
                              className="mt-4 flex items-center space-x-2 text-indigo-500"
                              onClick={handleAddCommentClick}
                            >
                              <FaPlus />
                              <span>Add Comment</span>
                            </button>
                          )}
                        </div>
                      </td>
                      
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (v, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 border ${
              currentPage === page ? "bg-indigo-500 text-white" : "bg-white"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AllTasks;
