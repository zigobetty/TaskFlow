import React, { useState, useEffect } from "react";
import "../css_files/Analytics.css";
import { Chart } from "primereact/chart";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../backend/firebase";


const Analytics = () => {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [chartType, setChartType] = useState("pie"); // Default chart type
  const [lineChartData, setLineChartData] = useState({});
  const [lineChartOptions, setLineChartOptions] = useState({});
  const [barChartData, setBarChartData] = useState({});
  const [barChartOptions, setBarChartOptions] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedDateTime = now.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      setCurrentDateTime(formattedDateTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser || !currentUser.id) {
          console.error("User not logged in or missing userId");
          return;
        }

        const taskQuerySnapshot = await getDocs(collection(db, "tasks"));
        const tasks = taskQuerySnapshot.docs
          .filter((doc) => doc.data().userId === currentUser.id)
          .map((doc) => doc.data());

        const taskCounts = {
          "To Do": 0,
          Doing: 0,
          "For Test": 0,
          Rework: 0,
          Done: 0,
        };

        tasks.forEach((task) => {
          if (task.state && taskCounts[task.state] !== undefined) {
            taskCounts[task.state]++;
          }
        });

        const documentStyle = getComputedStyle(document.documentElement);

        // Pie chart data and options
        const pieData = {
          labels: ["To Do", "Doing", "For Test", "Rework", "Done"],
          datasets: [
            {
              data: [
                taskCounts["To Do"],
                taskCounts["Doing"],
                taskCounts["For Test"],
                taskCounts["Rework"],
                taskCounts["Done"],
              ],
              backgroundColor: [
                "#FFD700",
                "#1E90FF",
                "#FF8C00",
                "#FF4500",
                "#32CD32",
              ],
            },
          ],
        };

        const pieOptions = {
          plugins: {
            legend: {
              position: "left",
              align: "start",
              labels: {
                boxWidth: 15,
                boxHeight: 15,
                padding: 15,
                font: {
                  size: 14,
                },
              },
            },
          },
          layout: {
            padding: {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20,
            },
          },
        };

        const lineData = {
          labels: ["To Do", "Doing", "For Test", "Rework", "Done"],
          datasets: [
            {
              label: "Tasks Count",
              data: [
                taskCounts["To Do"],
                taskCounts["Doing"],
                taskCounts["For Test"],
                taskCounts["Rework"],
                taskCounts["Done"],
              ],
              fill: false,
              borderColor: "#685daa",
              tension: 0.4,
            },
          ],
        };

        const lineOptions = {
          maintainAspectRatio: false,
          aspectRatio: 0.6,
          plugins: {
            legend: {
              labels: {
                color: "#FFFFFF",
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: (context) => {
                  const labels = context.chart.data.labels;
                  const states = [
                    { name: "To Do", color: "#FFD700" },
                    { name: "Doing", color: "#1E90FF" },
                    { name: "For Test", color: "#FF8C00" },
                    { name: "Rework", color: "#FF4500" },
                    { name: "Done", color: "#32CD32" },
                  ];
                  const labelIndex = context.index;
                  const state = states.find((s) => s.name === labels[labelIndex]);
                  return state ? state.color : "#FFFFFF";
                },
              },
              grid: {
                color: "#cccccc",
              },
            },
            y: {
              ticks: {
                color: "#666666",
              },
              grid: {
                color: "#cccccc",
              },
            },
          },
        };
        const barData = {
          labels: ["To Do", "Doing", "For Test", "Rework", "Done"],
          datasets: [
            {
              label: "Task Counts",
              data: [
                taskCounts["To Do"],
                taskCounts["Doing"],
                taskCounts["For Test"],
                taskCounts["Rework"],
                taskCounts["Done"],
              ],
              backgroundColor: [
                "rgba(255, 215, 0, 0.2)", 
                "rgba(30, 144, 255, 0.2)", 
                "rgba(255, 140, 0, 0.2)",
                "rgba(255, 69, 0, 0.2)", 
                "rgba(50, 205, 50, 0.2)", 
              ],
              borderColor: [
                "#FFD700", 
                "#1E90FF", 
                "#FF8C00", 
                "#FF4500",
                "#32CD32", 
              ],
              borderWidth: 1,
              
            },
          ],
        };
        
        const barOptions = {
          plugins: {
            legend: {
              display: true,
              labels: {
                color: "#FFFFFF",
                font: {
                  size: 14,
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#FFFFFF", 
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)", 
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: "#FFFFFF", 
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)", 
              },
            },
          },
          maintainAspectRatio: false, 
          layout: {
            padding: 20,
          },
        };
        const containerStyle = {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#2D2D2D",
        };

        setChartData(pieData);
        setChartOptions(pieOptions);
        setLineChartData(lineData);
        setLineChartOptions(lineOptions);
        setBarChartData(barData);
        setBarChartOptions(barOptions);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
    
      <p className="header-text-first">Analytics of your Tasks and Goals</p>
      <div>
        <p className="choose-chart-text">Choose Chart View</p>
        <select
          className="chart-dropdown"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          style={{
            marginTop: "0.5rem",
            fontSize: "1rem",
            marginBottom: "1rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#3C3C3C",
            borderColor: "#3C3C3C",
            color: "white",
            opacity: "0.9",
          }}
        >
          <option value="pie">Pie</option>
          <option value="doughnut">Doughnut</option>
          <option value="line">Line</option>
          <option value="bar">Bar</option>
        </select>
      </div>
      <div className="main-char-container">
        <div className="card flex justify-content-center">
          {chartType === "line" ? (
            <Chart
              type="line"
              data={lineChartData}
              options={lineChartOptions}
              style={{ width: "600px", height: "600px", opacity: "0.9" }}
            />
          ) : chartType === "bar" ? (
            <Chart
              type="bar"
              data={barChartData}
              options={barChartOptions}
              style={{ width: "43em", height: "600px", opacity: "0.9" }}
            />
          ) : (
            <Chart
              type={chartType}
              data={chartData}
              options={chartOptions}
              style={{ width: "600px", height: "600px", opacity: "0.9" }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Analytics;
