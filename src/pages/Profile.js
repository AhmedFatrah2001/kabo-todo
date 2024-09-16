import React, { useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import {
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { format } from "date-fns";

Chart.register(CategoryScale, LinearScale, ArcElement, BarElement, Tooltip, Legend);

const Profile = () => {
  const userId = localStorage.getItem("userId");
  const [performance, setPerformance] = useState(null);
  const [validatedTasks, setValidatedTasks] = useState([]);
  const pieChartRef1 = React.useRef(null);
  const pieChartRef2 = React.useRef(null);
  const barChartRef = React.useRef(null);
  const pieChartInstanceRef1 = React.useRef(null);
  const pieChartInstanceRef2 = React.useRef(null);
  const barChartInstanceRef = React.useRef(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user-performance/${userId}`
        );
        setPerformance(response.data);
      } catch (error) {
        console.error("Error fetching user performance:", error);
      }
    };

    const fetchValidatedTasks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/dashboard/tasks/filter?responsible_user_id=${userId}&is_validated=true`
        );
        setValidatedTasks(
          response.data.map((task) => ({
            validatedDate: format(new Date(task.validated_at), "yyyy-MM-dd"),
            startDate: format(new Date(task.start_date), "yyyy-MM-dd"),
            endDate: format(new Date(task.end_date), "yyyy-MM-dd"),
          }))
        );
      } catch (error) {
        console.error("Error fetching validated tasks:", error);
      }
    };

    fetchPerformance();
    fetchValidatedTasks();
  }, [userId]);

  useEffect(() => {
    if (performance) {
      if (pieChartInstanceRef1.current) pieChartInstanceRef1.current.destroy();
      if (pieChartInstanceRef2.current) pieChartInstanceRef2.current.destroy();
      if (barChartInstanceRef.current) barChartInstanceRef.current.destroy();

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
          animation: {
            duration: 1000, // Animation for the chart
          },
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
          animation: {
            duration: 1000,
          },
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            },
          },
        },
      });

      // Bar chart for monthly validated tasks
      const taskCountsByMonth = Array(12).fill(0);
      validatedTasks.forEach((task) => {
        const month = new Date(task.validatedDate).getMonth();
        taskCountsByMonth[month]++;
      });

      const barChartData = {
        labels: [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ],
        datasets: [
          {
            label: "Validated Tasks",
            data: taskCountsByMonth,
            backgroundColor: "#4CAF50",
          },
        ],
      };

      barChartInstanceRef.current = new Chart(barChartRef.current, {
        type: "bar",
        data: barChartData,
        options: {
          maintainAspectRatio: false,
          responsive: true,
          animation: {
            duration: 1000,
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });

      return () => {
        pieChartInstanceRef1.current.destroy();
        pieChartInstanceRef2.current.destroy();
        barChartInstanceRef.current.destroy();
      };
    }
  }, [performance, validatedTasks]);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">Profile</h1>
      {!performance ? (
        <p className="text-center text-lg">Loading performance stats...</p>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold text-center mb-6">
            Your Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {[
              { title: "Tasks Validated", value: performance.tasks_validated },
              { title: "Early Tasks", value: performance.early_tasks },
              { title: "Late Tasks", value: performance.late_tasks },
              {
                title: "Early Hours",
                value: `${performance.early_hours} hours`,
              },
              { title: "Late Hours", value: `${performance.late_hours} hours` },
              { title: "Overall Score", value: performance.score },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white shadow-lg p-6 rounded-lg text-center"
              >
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-center mb-6">
            Performance Charts
          </h2>
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

          <h2 className="text-2xl font-semibold text-center mb-6">
            Monthly Validated Tasks
          </h2>
          <div className="bg-white shadow-lg p-6 rounded-lg mb-12">
            <div className="flex justify-center">
              <canvas
                ref={barChartRef}
                style={{ width: "400px", height: "300px" }}
              ></canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
