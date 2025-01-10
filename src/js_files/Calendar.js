import React, { useState, useEffect } from "react";
import "../css_files/Home.css";
import "../css_files/Calendar.css";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Calendar } from "primereact/calendar";
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
      // Dohvat trenutnog korisnika iz localStorage
      const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
      console.log("Current user:", currentUser);
  
      // Provera da li je korisnik ulogovan
      if (!currentUser.id) {
        console.warn("No user is logged in or user ID is missing.");
        setHighlightedDays({});
        return;
      }
  
      // Dohvat podataka iz kolekcije "tasks" u Firestore
      const querySnapshot = await getDocs(collection(db, "tasks"));
      console.log("Query snapshot size:", querySnapshot.size);
  
      // Obrada podataka i grupisanje po datumima
      const deadlines = {};
  
      querySnapshot.docs
        .filter((doc) => doc.data().userId === currentUser.id) // Filtriranje po korisničkom ID-u
        .forEach((doc) => {
          const { task_deadline: deadline, state, task_name: name } = doc.data();
  
          // Provera validnosti podataka
          if (deadline && state) {
            const formattedDate = dayjs(deadline).format("YYYY-MM-DD");
  
            // Grupisanje po datumu
            if (!deadlines[formattedDate]) {
              deadlines[formattedDate] = [];
            }
  
            deadlines[formattedDate].push({
              color: stateColors[state] || "#FFFFFF", // Fallback za nepoznate boje
              name: name || "Unnamed Task", // Fallback za ime zadatka
            });
          }
        });
  
      console.log("Fetched task deadlines:", deadlines);
  
      // Ažuriranje state-a
      setHighlightedDays(deadlines);
    } catch (error) {
      // Prikazivanje grešaka u konzoli
      console.error("Error fetching task deadlines:", error);
  
      // Opcionalno: Postavljanje praznog state-a u slučaju greške
      setHighlightedDays({});
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
            sx={{
              backgroundColor: "#3c3c3c",
              ".MuiPickersDay-root": {
                color: "white",
                fontSize: "1.5em",
              },
              ".MuiPickersArrowSwitcher-button": {
                color: "white",
                fontSize: "2em",
              },
              ".MuiTypography-root": {
                fontWeight: "700",
                fontFamily: "'Montserrat', sans-serif",
              },
            }}
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
