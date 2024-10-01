import React, { useState } from "react";
import UserManagement from "../components/UserManagement";
import TaskManagement from "../components/TaskManagement";
import ClientManagement from "../components/ClientManagement";
import ValidationManagement from "../components/ValidationManagement";
import UserPerformance from "../components/UserPerformance"; 


const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState(null);

  const handleCardClick = (component) => {
    setActiveComponent(component);
  };

  const handleClose = () => {
    setActiveComponent(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => handleCardClick("user")}
          className="bg-white shadow-lg rounded-lg p-6 cursor-pointer transform transition-transform duration-500 hover:scale-105"
        >
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <p>Manage users, view profiles</p>
        </div>
        <div
          onClick={() => handleCardClick("task")}
          className="bg-white shadow-lg rounded-lg p-6 cursor-pointer transform transition-transform duration-500 hover:scale-105"
        >
          <h2 className="text-2xl font-bold mb-4">Task Management</h2>
          <p>Create, view, and manage tasks with detailed information.</p>
        </div>
        <div
          onClick={() => handleCardClick("client")}
          className="bg-white shadow-lg rounded-lg p-6 cursor-pointer transform transition-transform duration-500 hover:scale-105"
        >
          <h2 className="text-2xl font-bold mb-4">Client Management</h2>
          <p>Manage clients and their details.</p>
        </div>
        <div
          onClick={() => handleCardClick("validation")}
          className="bg-white shadow-lg rounded-lg p-6 cursor-pointer transform transition-transform duration-500 hover:scale-105"
        >
          <h2 className="text-2xl font-bold mb-4">Validation Management</h2>
          <p>View and manage task validations.</p>
        </div>
      </div>

      {activeComponent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-8xl p-6 mx-4 my-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-2xl font-bold"
            >
              &times;
            </button>
            <div className="overflow-y-auto max-h-[80vh]">
              {activeComponent === "user" && <UserManagement />}
              {activeComponent === "task" && <TaskManagement />}
              {activeComponent === "client" && <ClientManagement />}
              {activeComponent === "validation" && <ValidationManagement />}
            </div>
          </div>
        </div>
      )}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">User Performance</h2>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <UserPerformance />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
