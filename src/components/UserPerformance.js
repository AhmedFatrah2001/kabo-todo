import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "chart.js/auto";
import {
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const UserPerformance = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [performance, setPerformance] = useState(null);
  const pieChartRef1 = React.useRef(null);
  const pieChartRef2 = React.useRef(null);
  const pieChartInstanceRef1 = React.useRef(null);
  const pieChartInstanceRef2 = React.useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/dashboard/users");
        const nonAdminUsers = response.data.filter(user => !user.isAdmin);
        setUsers(nonAdminUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch performance when a user is selected
  useEffect(() => {
    if (selectedUserId) {
      const fetchPerformance = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/user-performance/${selectedUserId}`
          );
          setPerformance(response.data);
        } catch (error) {
          console.error("Error fetching user performance:", error);
        }
      };

      fetchPerformance();
    }
  }, [selectedUserId]);

  // Function to render pie charts
  useEffect(() => {
    if (performance) {
      if (pieChartInstanceRef1.current) pieChartInstanceRef1.current.destroy();
      if (pieChartInstanceRef2.current) pieChartInstanceRef2.current.destroy();

      const pieChartData1 = {
        labels: ["Early Hours", "Late Hours"],
        datasets: [
          {
            data: [performance.early_hours, performance.late_hours],
            backgroundColor: ["#ADD8E6", "#FF7F7F"],
          },
        ],
      };

      pieChartInstanceRef1.current = new Chart(pieChartRef1.current, {
        type: "pie",
        data: pieChartData1,
        options: {
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            },
          },
        },
      });

      const pieChartData2 = {
        labels: ["Early Tasks", "Late Tasks"],
        datasets: [
          {
            data: [performance.early_tasks, performance.late_tasks],
            backgroundColor: ["#ADD8E6", "#FF4D4D"],
          },
        ],
      };

      pieChartInstanceRef2.current = new Chart(pieChartRef2.current, {
        type: "pie",
        data: pieChartData2,
        options: {
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            },
          },
        },
      });

      return () => {
        pieChartInstanceRef1.current.destroy();
        pieChartInstanceRef2.current.destroy();
      };
    }
  }, [performance]);

  // Helper function to render performance cards
  const renderPerformanceCards = () => {
    if (!performance) return null;
    const cardsData = [
      { title: "Tasks Validated", value: performance.tasks_validated },
      { title: "Early Tasks", value: performance.early_tasks },
      { title: "Late Tasks", value: performance.late_tasks },
      {
        title: "Early Hours",
        value: `${performance.early_hours} hours`,
      },
      { title: "Late Hours", value: `${performance.late_hours} hours` },
      { title: "Overall Score", value: performance.score },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {cardsData.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-lg p-6 rounded-lg text-center"
          >
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-3xl font-bold text-indigo-600">{item.value}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">User Performance</h1>

      <div className="mb-8">
        <label htmlFor="user-select" className="block mb-2 text-lg font-semibold">
          Select a User
        </label>
        <select
          id="user-select"
          className="block w-full p-3 border border-gray-300 rounded-lg text-lg"
          value={selectedUserId || ""}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="" disabled>
            Select a user...
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      {selectedUserId && performance ? (
        <>
          <h2 className="text-2xl font-semibold text-center mb-6">
            Performance
          </h2>
          {renderPerformanceCards()}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-center">
                Early vs. Late Hours
              </h3>
              <div className="flex justify-center">
                <canvas
                  ref={pieChartRef1}
                  style={{ width: "200px", height: "200px" }}
                ></canvas>
              </div>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-center">
                Early vs. Late Tasks
              </h3>
              <div className="flex justify-center">
                <canvas
                  ref={pieChartRef2}
                  style={{ width: "200px", height: "200px" }}
                ></canvas>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-lg">Please select a user to view performance.</p>
      )}
    </div>
  );
};

export default UserPerformance;
