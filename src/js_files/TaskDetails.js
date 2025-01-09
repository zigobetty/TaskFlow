import React, { useState, useEffect } from "react";
import "../css_files/TaskDetails.css";
import { Button } from "flowbite-react";
import { HiChat } from "react-icons/hi";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../backend/firebase";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { OrderList } from "primereact/orderlist";

const Details = () => {
  const [name_value_details, setNameValueDetails] = useState("");
  const [desc_value_details, setDescValueDetails] = useState("");
  const [comment_value_details, setCommentValueDetails] = useState("");
  const [task_date_details, setTaskDateDetails] = useState(new Date());
  const [deadline_details, setDeadlineDetails] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [tasks, setTasks] = useState({
    "To Do": [],
    Doing: [],
    "For Test": [],
    Rework: [],
    Done: [],
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const openModal = (task) => {
    setSelectedTask(task);
    setNameValueDetails(task.name || ""); // Populate Task Name
    setDescValueDetails(task.desc || ""); // Populate Task Description
    setCommentValueDetails(task.comment || ""); // Populate Task Comment
    setTaskDateDetails(task.date ? new Date(task.date) : new Date()); // Convert Task Date to Date object
    setDeadlineDetails(task.deadline ? new Date(task.deadline) : null); // Convert Deadline to Date object
    setSelectedState(states.find((state) => state.name === task.state) || null); // Populate State
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalVisible(false);
  };

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
    const fetchTasks = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser || !currentUser.id) {
          console.error("User not logged in or missing userId");
          return;
        }

        const taskQuerySnapshot = await getDocs(collection(db, "tasks"));

        const fetchedTasks = taskQuerySnapshot.docs
          .filter((doc) => doc.data().userId === currentUser.id)
          .map((doc) => {
            const taskData = doc.data();
            return {
              id: doc.id,
              name: taskData.task_name || "",
              desc: taskData.task_desc || "", // Ensure desc is retrieved
              comment: taskData.task_comment || "", // Ensure comment is retrieved
              date: taskData.task_date || null, // Ensure date is retrieved
              deadline: taskData.task_deadline || null,
              state: taskData.state || "",
              commentCount: taskData.task_comment ? 1 : 0,
            };
          });

        // Group tasks by state
        const classifiedTasks = {
          "To Do": [],
          Doing: [],
          "For Test": [],
          Rework: [],
          Done: [],
        };

        fetchedTasks.forEach((task) => {
          if (classifiedTasks[task.state]) {
            classifiedTasks[task.state].push(task);
          }
        });

        setTasks(classifiedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const [selectedState, setSelectedState] = useState(null);
  const states = [
    { name: "To Do", code: "TD", color: "#FFD700" }, // Žuta
    { name: "Doing", code: "D", color: "#1E90FF" }, // Plava
    { name: "For Test", code: "FT", color: "#FF8C00" }, // Narančasta
    { name: "Rework", code: "R", color: "#FF4500" }, // Crvena
    { name: "Done", code: "DN", color: "#32CD32" }, // Zelena
  ];

  const stateTemplate = (option) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: option.color,
            marginRight: "8px",
          }}
        ></span>
        {option.name}
      </div>
    );
  };
  const stateValueTemplate = (option) => {
    if (!option) {
      return <span style={{ color: "gray" }}>Select a State</span>; // Placeholder za odabir
    }

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: option.color,
            marginRight: "8px",
          }}
        ></span>
        {option.name}
      </div>
    );
  };

  const updateTaskInFirestore = async () => {
    try {
      if (!selectedTask || !selectedTask.id) {
        console.error("Nema odabranog zadatka za ažuriranje.");
        return;
      }

      const taskRef = doc(db, "tasks", selectedTask.id);

      const updatedTask = {
        task_name: name_value_details,
        task_desc: desc_value_details,
        task_comment: comment_value_details,
        task_date: task_date_details
          ? task_date_details.toLocaleDateString("en-US") // Lokalizirani datum
          : null,
        task_deadline: deadline_details
          ? deadline_details.toLocaleDateString("en-US") // Lokalizirani datum
          : null,
        state: selectedState ? selectedState.name : "",
      };

      await updateDoc(taskRef, updatedTask);

      console.log("Zadatak uspješno ažuriran.");

      // Osvježavanje lokalnog stanja
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        const oldState = selectedTask.state; // Staro stanje
        const newState = selectedState.name; // Novo stanje

        // Uklanjanje zadatka iz stare kategorije
        updatedTasks[oldState] = updatedTasks[oldState].filter(
          (task) => task.id !== selectedTask.id
        );

        // Dodavanje zadatka u novu kategoriju
        if (!updatedTasks[newState]) {
          updatedTasks[newState] = [];
        }
        updatedTasks[newState].push({
          ...selectedTask,
          name: name_value_details,
          desc: desc_value_details,
          comment: comment_value_details,
          date: updatedTask.task_date,
          deadline: updatedTask.task_deadline,
          state: newState,
        });

        return updatedTasks;
      });

      closeModal(); // Zatvaranje modala nakon spremanja
    } catch (error) {
      console.error("Greška prilikom ažuriranja zadatka:", error);
    }
  };

  return (
    <>
      <div className="header-text-cont">
        <p className="header-text-first">Edit your task</p>
      </div>
      <div className="header-text-cont">
        <p className="header-text-second">Change task name, deadline, ...</p>
      </div>

      <div className="state-cont">
        <div className="state-cont-header-text">
          {Object.keys(tasks).map((state, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor:
                      state === "To Do"
                        ? "#FFD700"
                        : state === "Doing"
                        ? "#1E90FF"
                        : state === "For Test"
                        ? "#FF8C00"
                        : state === "Rework"
                        ? "#FF4500"
                        : "#32CD32", // Default for Done
                    marginRight: "8px",
                  }}
                ></span>
                <p className="heder-text">{state.toUpperCase()}</p>
              </div>
              <div
                style={{
                  width: "25px",
                  height: "25px",
                  borderRadius: "50%",
                  backgroundColor: "gray",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  marginLeft: "8px",
                }}
              >
                {tasks[state].length}
              </div>
            </div>
          ))}
        </div>
        <div className="main-cont-state">
          {Object.keys(tasks).map((state) => (
            <div key={state} className="main-toDo-cont">
              {tasks[state].map((task) => (
                <div key={task.id} className="inner-main-toDo-cont">
                  <p className="title-taskName">{task.name}</p>
                  <p
                    className="title-deadline"
                    style={{
                      color:
                        task.deadline &&
                        new Date(task.deadline).getTime() <
                          new Date().setHours(0, 0, 0, 0)
                          ? "#FF4500" // Rok je prošao
                          : task.deadline &&
                            new Date(task.deadline).getTime() ===
                              new Date().setHours(0, 0, 0, 0)
                          ? "#FF8C00" // Rok je danas
                          : "#32CD32", // Rok je u budućnosti
                    }}
                  >
                    Deadline: {task.deadline}
                  </p>

                  <Button
                    className="custom-button-details "
                    onClick={() => openModal(task)}
                  >
                    View Details / Edit Task
                  </Button>
                  <div className="chat-icon-cont">
                    <HiChat
                      style={{
                        fontSize: "1.5rem",
                        color: "white",
                        opacity: "0.5",
                      }}
                    />
                    <p>{task.commentCount}</p>
                  </div>
                </div>
              ))}
              {tasks[state].length === 0 && (
                <p
                  className="no-tasks-text"
                  style={{ color: "white", opacity: "0.5", paddingLeft: "2em" }}
                >
                  No tasks in this section
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      {isModalVisible && selectedTask && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2
              className="popup-header-text-details"
              style={{
                marginTop: "1em",
                display: "flex",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
                opacity: "0.8",
              }}
            >
              TASK DETAILS AND EDITING ZONE
            </h2>
            <div className="popup-main-input-container">
              <div className="name-task-cont">
                <p
                  style={{
                    marginLeft: "-10em",
                    color: "white",
                    opacity: "0.8",
                  }}
                >
                  Task Name
                </p>
                <InputText
                  value={name_value_details}
                  className="name-task-input"
                  onChange={(e) => setNameValueDetails(e.target.value)}
                  placeholder="Enter task name"
                />
              </div>
              <div className="name-task-cont">
                <p
                  style={{ marginLeft: "-8em", color: "white", opacity: "0.8" }}
                >
                  Task Description
                </p>
                <InputTextarea
                  autoResize
                  value={desc_value_details}
                  className="name-task-input"
                  onChange={(e) => setDescValueDetails(e.target.value)}
                  placeholder="Enter task description"
                />
              </div>
              <div className="name-task-cont">
                <p
                  style={{
                    marginLeft: "-11em",
                    color: "white",
                    opacity: "0.8",
                  }}
                >
                  Comment
                </p>
                <InputTextarea
                  autoResize
                  value={comment_value_details}
                  className="name-task-input"
                  onChange={(e) => setCommentValueDetails(e.target.value)}
                  placeholder="Enter comment"
                />
              </div>
              <div className="name-task-cont">
                <p
                  style={{
                    marginLeft: "-11em",
                    color: "white",
                    opacity: "0.8",
                  }}
                >
                  Task Date
                </p>

                <Calendar
                  value={task_date_details}
                  onChange={(e) => setTaskDateDetails(e.value)}
                  placeholder="Enter task date"
                  className="custom-calendar"
                  readOnlyInput
                />
              </div>
              <div className="name-task-cont">
                <p
                  style={{
                    marginLeft: "-11em",
                    color: "white",
                    opacity: "0.8",
                  }}
                >
                  Deadline
                </p>

                <Calendar
                  value={deadline_details}
                  onChange={(e) => setDeadlineDetails(e.value)}
                  placeholder="Enter deadline"
                  className="custom-calendar"
                  readOnlyInput
                />
              </div>
              <div className="name-task-cont">
                <p
                  style={{
                    marginLeft: "-13em",
                    color: "white",
                    opacity: "0.8",
                  }}
                >
                  State
                </p>

                <Dropdown
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.value)}
                  options={states}
                  optionLabel="name"
                  placeholder="Select a City"
                  className="name-task-input custom-dropdown"
                  itemTemplate={stateTemplate}
                  valueTemplate={stateValueTemplate}
                  checkmark={true}
                  highlightOnSelect={false}
                />
              </div>
            </div>

            <div className="button-cont-details">
              <Button
                onClick={updateTaskInFirestore}
                className="custom-save-button"
              >
                Update Task Details
              </Button>
              <Button onClick={closeModal} className="custom-close-button">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Details;
