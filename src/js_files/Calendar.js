import React, { useState, useEffect } from "react";
import "../css_files/Home.css";
import "../css_files/Calendar.css";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Modal from "@mui/material/Modal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../backend/firebase";
import dayjs from "dayjs";
import { Button } from "flowbite-react";

const stateColors = {
  "To Do": "#FFD700",
  Doing: "#1E90FF",
  "For Test": "#FF8C00",
  Rework: "#FF4500",
  Done: "#32CD32",
};

function ServerDay(props) {
  const {
    highlightedDays = {},
    day,
    outsideCurrentMonth,
    onClickDay,
    ...other
  } = props;

  const formattedDate = dayjs(day).format("YYYY-MM-DD");
  const tasksForDate = highlightedDays[formattedDate] || [];

  return (
    <Tooltip
      title={
        tasksForDate.length > 0
          ? tasksForDate.map((task) => task.name).join(", ")
          : ""
      }
      classes={{ tooltip: "custom-tooltip" }}
      arrow
    >
      <Badge
        overlap="circular"
        badgeContent={
          tasksForDate.length > 0 ? (
            <div style={{ display: "flex", gap: "2px" }}>
              {tasksForDate.map((task, index) => (
                <span
                  key={index}
                  style={{
                    width: "0.8em",
                    height: "0.8em",
                    borderRadius: "50%",
                    backgroundColor: task.color,
                  }}
                ></span>
              ))}
            </div>
          ) : null
        }
        sx={{
          "& .MuiBadge-badge": {
            transform: "translate(-50%, -100%)",
            left: "50%",
            top: "0",
          },
        }}
      >
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
          onClick={() => onClickDay(formattedDate, tasksForDate)}
        />
      </Badge>
    </Tooltip>
  );
}

const CalendarApp = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [highlightedDays, setHighlightedDays] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tasksForDate, setTasksForDate] = useState([]);
  const [isTaskListModalVisible, setTaskListModalVisible] = useState(false);
  const [isTaskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const states = [
    { name: "To Do", code: "TD", color: "#FFD700" }, // Žuta
    { name: "Doing", code: "D", color: "#1E90FF" }, // Plava
    { name: "For Test", code: "FT", color: "#FF8C00" }, // Narančasta
    { name: "Rework", code: "R", color: "#FF4500" }, // Crvena
    { name: "Done", code: "DN", color: "#32CD32" }, // Zelena
  ];

  const fetchHighlightedDays = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        console.error("No user is logged in.");
        setHighlightedDays({});
        return;
      }

      const querySnapshot = await getDocs(collection(db, "tasks"));
      const deadlines = {};

      querySnapshot.docs
      .filter((doc) => doc.data().userId === currentUser.id)
      .forEach((doc) => {
        const data = doc.data();
        console.log("Fetched Task Data:", data); 
        const { task_deadline: deadline, state, task_name: name } = data;
    
        const formattedDate = dayjs(deadline).format("YYYY-MM-DD");
        if (!deadlines[formattedDate]) {
          deadlines[formattedDate] = [];
        }
        deadlines[formattedDate].push({
          color: stateColors[state],
          name,
          deadline: deadline, 
          ...data,
        });
      });
    

      setHighlightedDays(deadlines);
    } catch (error) {
      console.error("Error fetching task deadlines:", error);
    }
  };

  useEffect(() => {
    fetchHighlightedDays();
  }, []);

  const handleMonthChange = () => {
    setIsLoading(true);
    fetchHighlightedDays();
    setIsLoading(false);
  };

  const handleDayClick = (date, tasks) => {
    if (tasks.length > 0) {
      setTasksForDate(tasks);
      setTaskListModalVisible(true);
    }
  };

  const openTaskDetails = (task) => {
    console.log("Selected Task:", task); 
    setSelectedTask(task);
    setTaskListModalVisible(false);
    setTaskDetailModalVisible(true);
  };
  

  return (
    <div className="calendar-container">
      <div className="card calendar-card">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            loading={isLoading}
            onMonthChange={handleMonthChange}
            renderLoading={() => <DayCalendarSkeleton />}
            slots={{
              day: ServerDay,
            }}
            slotProps={{
              day: {
                highlightedDays,
                onClickDay: handleDayClick,
              },
            }}
          />
        </LocalizationProvider>
      </div>

      {isTaskListModalVisible && (
        <Modal
          open={isTaskListModalVisible}
          onClose={() => setTaskListModalVisible(false)}
          style={{
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-content">
            <h2 className="selected-task-text">TASKS FOR SELECTED DATE (See more details)</h2>
            {tasksForDate.map((task) => (
              <div
              className="hover-element"
                key={task.id}
                style={{
                  padding: "10px",
                  backgroundColor: task.color,
                  cursor: "pointer",
                  borderRadius: "5px",
                  minWidth: "27em",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: "900",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => openTaskDetails(task)}
              >
                {task.name}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {isTaskDetailModalVisible && selectedTask && (
        <Modal
          open={isTaskDetailModalVisible}
          onClose={() => setTaskDetailModalVisible(false)}
          style={{
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-content-second">
            <p className="task-details-cal-text-HEADER">
              TASK DETAILS FOR SELECTED DATE
            </p>
            <p className="task-details-cal-text">
              <strong>Task Name:</strong> {selectedTask.name}
            </p>
            <p className="task-details-cal-text">
              <strong>Description:</strong> {selectedTask.task_desc}
            </p>
            <p className="task-details-cal-text">
              <strong>Comment:</strong> {selectedTask.task_comment}
            </p>
            <p className="task-details-cal-text">
              <strong>Deadline:</strong>{" "}
              <span
                style={{
                  color: selectedTask.deadline
                    ? new Date(selectedTask.deadline).getTime() <
                      new Date().setHours(0, 0, 0, 0)
                      ? "#FF4500" 
                      : new Date(selectedTask.deadline).getTime() ===
                        new Date().setHours(0, 0, 0, 0)
                      ? "#FF8C00" 
                      : "#32CD32" 
                    : "black", 
                }}
              >
                {selectedTask.deadline || "No deadline set"}
              </span>
            </p>

            <p className="task-details-cal-text">
              <strong style={{ color: "white" }}>Task State:</strong>{" "}
              <span
                style={{
                  color:
                    states.find((state) => state.name === selectedTask.state)
                      ?.color || "black", // Default to black if no match
                }}
              >
                {selectedTask.state}
              </span>
            </p>

            <div className="button-close-cal-cont">
              <Button
                onClick={() => setTaskDetailModalVisible(false)}
                className="custom-close-button"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarApp;
