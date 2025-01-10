import React, { useState, useEffect } from "react";
import "../css_files/Home.css";
import "../css_files/Calendar.css";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../backend/firebase";
import dayjs from "dayjs";

const stateColors = {
  "To Do": "#FFD700",
  Doing: "#1E90FF",
  "For Test": "#FF8C00",
  Rework: "#FF4500",
  Done: "#32CD32",
};

function ServerDay(props) {
  const { highlightedDays = {}, day, outsideCurrentMonth, ...other } = props;

  const formattedDate = dayjs(day).format("YYYY-MM-DD");
  const tasksForDate = highlightedDays[formattedDate] || []; // Array of tasks

  return (
    <Tooltip
      title={
        tasksForDate.length > 0
          ? tasksForDate.map((task) => task.name).join(", ")
          : ""
      }
      arrow
      classes={{ tooltip: "custom-tooltip" }}
    >
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={
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
        }
        sx={{
          "& .MuiBadge-badge": {
            display: "flex",
            flexDirection: "row",
            gap: "2px",
            transform: "translate(-50%, -100%)",
            top: "0em",
            left: "50%",
          },
        }}
      >
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    </Tooltip>
  );
}

const CalendarApp = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [highlightedDays, setHighlightedDays] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchHighlightedDays = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
      if (!currentUser.id) {
        console.warn("No user is logged in or ID missing.");
        setHighlightedDays({});
        return;
      }
  
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const deadlines = {};
  
      querySnapshot.docs
        .filter((doc) => doc.data().userId === currentUser.id)
        .forEach((doc) => {
          const { task_deadline: deadline, state, task_name: name } = doc.data();
          if (deadline && state) {
            const formattedDate = dayjs(deadline).format("YYYY-MM-DD");
            if (!deadlines[formattedDate]) {
              deadlines[formattedDate] = [];
            }
            deadlines[formattedDate].push({ color: stateColors[state], name });
          }
        });
  
      setHighlightedDays(deadlines);
    } catch (error) {
      console.error("Error fetching task deadlines:", error);
    }
  };
  

  useEffect(() => {
    fetchHighlightedDays();
  }, []);

  const handleMonthChange = (date) => {
    setIsLoading(true);
    setHighlightedDays({});
    fetchHighlightedDays();
    setIsLoading(false);
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
              },
            }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
};

export default CalendarApp;
