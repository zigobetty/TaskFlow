import React, { useState, useEffect } from "react";
import "../css_files/Home.css";
import { Label, TextInput, Button } from "flowbite-react";
import {
  HiMail,
  HiLockClosed,
  HiUser,
  HiPlus,
  HiTrash,
  HiPencil,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tooltip } from "primereact/tooltip";
import { InputTextarea } from "primereact/inputtextarea";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../backend/firebase";

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [name_value, setNameValue] = useState("");
  const [desc_value, setDescValue] = useState("");
  const [comment_value, setCommentValue] = useState("");
  const [task_date, setTaskDate] = useState(new Date());
  const [deadline, setDeadline] = useState(null);
  const [userName, setUserName] = useState("");
  const openPopup = () => setPopupVisible(true);
  const closePopup = () => setPopupVisible(false);
  const [tasks, setTasks] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editedState, setEditedState] = useState(null);
  const [isEditPopupVisible, setEditPopupVisible] = useState(false); // Vidljivost popup-a
  const [editingTask, setEditingTask] = useState(null); // Trenutni zadatak koji se uređuje
  const [newState, setNewState] = useState(null); // Novo stanje
  const [fullText, setFullText] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const openModal = (text) => {
    setFullText(text);
    setModalVisible(true);
  };

  const closeModal = () => {
    setFullText("");
    setModalVisible(false);
  };
  const truncateText = (text, maxLength = 40) => {
    if (!text) return "-";
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const saveTask = async () => {
    try {
      // Normalize the task_date and deadline to ignore time
      const normalizedTaskDate = new Date(
        task_date.getFullYear(),
        task_date.getMonth(),
        task_date.getDate()
      );
      const normalizedDeadline = new Date(
        deadline.getFullYear(),
        deadline.getMonth(),
        deadline.getDate()
      );

      // Validation: Ensure deadline is not before task date
      if (normalizedDeadline < normalizedTaskDate) {
        setWarningMessage(
          "Invalid deadline. Deadline cannot be before Task Date."
        );
        return;
      }

      const newTask = {
        name: name_value,
        desc: desc_value,
        comment: comment_value,
        date: task_date ? task_date.toLocaleDateString("en-US") : "",
        deadline: deadline ? deadline.toLocaleDateString("en-US") : "",
        state: selectedState ? selectedState.name : "",
      };

      // Save the task to Firestore
      const docRef = await saveTaskToFirestore(newTask);

      // Add `id` to the local task object
      const taskWithId = { ...newTask, id: docRef.id };

      // Add the task to the local state
      setTasks((prevTasks) => [...prevTasks, taskWithId]);

      // Reset form values
      setNameValue("");
      setDescValue("");
      setCommentValue("");
      setTaskDate(new Date());
      setDeadline(null);
      setSelectedState(null);
      setWarningMessage(""); // Clear warning message
      closePopup();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.fullName) {
      setUserName(currentUser.fullName);
    }
  }, []);
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
  const stateBodyTemplate = (rowData) => {
    const state = states.find((s) => s.name === rowData.state);
    if (!state) return rowData.state;

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: state.color,
            marginRight: "8px",
          }}
        ></span>
        {rowData.state}
      </div>
    );
  };

  const deleteTaskFromFirestore = async (taskId) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await deleteDoc(taskRef);
      console.log("Task successfully deleted");
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };
  const deleteTask = async (taskIndex) => {
    try {
      const taskToDelete = tasks[taskIndex];

      if (taskToDelete && taskToDelete.id) {
        await deleteTaskFromFirestore(taskToDelete.id);

        setTasks((prevTasks) =>
          prevTasks.filter((_, index) => index !== taskIndex)
        );
        console.log("Task successfully deleted.");
      } else {
        console.error("Task ID not found.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const actionBodyTemplate = (rowData, options) => {
    return (
      <>
        <div className="actions-cont">
          {" "}
          <span id={`edit-tooltip-${options.rowIndex}`}>
            <Button
              onClick={() => openEditPopup(rowData)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HiPencil
                style={{
                  fontSize: "1.5rem",
                  color: "white",
                }}
              />
            </Button>
          </span>
          <span id={`delete-tooltip-${options.rowIndex}`}>
            <Button
              onClick={() => deleteTask(options.rowIndex)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HiTrash
                style={{
                  fontSize: "1.5rem",
                  color: "white",
                }}
              />
            </Button>
          </span>
        </div>

        <Tooltip
          target={`#delete-tooltip-${options.rowIndex}`}
          content="Delete Task"
          position="bottom"
          style={{
            backgroundColor: "#6c6969",
            color: "white",
            width: "8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            marginLeft: "-0.5rem",
          }}
        />
        <Tooltip
          target={`#edit-tooltip-${options.rowIndex}`}
          content="Edit Task State"
          position="bottom"
          style={{
            backgroundColor: "#6c6969",
            color: "white",
            width: "8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            marginLeft: "-0.5rem",
          }}
        />
      </>
    );
  };
  const saveTaskToFirestore = async (task) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.id) {
      throw new Error("No user is logged in.");
    }

    const docRef = await addDoc(collection(db, "tasks"), {
      userId: currentUser.id, // Dodaj userId
      task_name: task.name,
      task_desc: task.desc,
      task_comment: task.comment,
      task_date: task.date,
      task_deadline: task.deadline,
      state: task.state,
    });

    return docRef; // Vrati referencu na dokument
  };

  const fetchTasksFromFirestore = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.id) {
        console.error("No user is logged in.");
        setTasks([]);
        return;
      }

      const querySnapshot = await getDocs(collection(db, "tasks"));
      const fetchedTasks = querySnapshot.docs
        .filter((doc) => doc.data().userId === currentUser.id)
        .map((doc) => ({
          id: doc.id, // Osigurajte da se `id` postavlja
          name: doc.data().task_name,
          desc: doc.data().task_desc,
          comment: doc.data().task_comment,
          date: doc.data().task_date,
          deadline: doc.data().task_deadline,
          state: doc.data().state,
        }));

      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasksFromFirestore();
  }, []);

  const updateTaskState = async () => {
    try {
      if (!editingTask || !newState) {
        console.error("Invalid task or state");
        return;
      }

      // Ažurirajte lokalno stanje samo za zadatak sa datim ID-jem
      const updatedTasks = tasks.map((task) =>
        task.id === editingTask.id ? { ...task, state: newState.name } : task
      );

      setTasks(updatedTasks);

      // Zatvorite popup
      setEditPopupVisible(false);

      // Ažurirajte Firestore
      const taskRef = doc(db, "tasks", editingTask.id);
      await updateDoc(taskRef, { state: newState.name });
      console.log("State successfully updated.");
    } catch (error) {
      console.error("Error updating state: ", error);
    }
  };

  const openEditPopup = (task) => {
    setEditingTask(task);
    setNewState(task.state); // Postavite trenutno stanje
    setEditPopupVisible(true);
  };

  useEffect(() => {
    const validateFields = () => {
      const isNameFilled = name_value.trim() !== ""; // Task Name is not empty
      const isTaskDateFilled = task_date !== null; // Task Date is selected
      const isDeadlineFilled = deadline !== null; // Deadline is selected
      const isStateSelected = selectedState !== null; // Status is selected

      // Update disabled state based on validation
      setIsSaveDisabled(
        !(
          isNameFilled &&
          isTaskDateFilled &&
          isDeadlineFilled &&
          isStateSelected
        )
      );
    };

    // Call validation function whenever the dependencies change
    validateFields();
  }, [name_value, task_date, deadline, selectedState]);

  return (
    <>
      <div className="home-cont">
        <div className="hello-cont">
          <p className="hello-text">Hello, {userName || "Name"}</p>
          <p className="calendar-text">{currentDateTime}</p>
        </div>

        {/* Uvjetno prikazivanje */}
        {tasks.length === 0 ? (
          <div className="task-cont">
            <p className="no-task-text">THERE IS NO TASK TO DO.</p>
            <p className="no-task-text_2">Let's start.</p>
          </div>
        ) : (
          <div className="scrollable-container">
            <DataTable
              value={tasks}
              tableStyle={{
                minWidth: "75rem",
                color: "white",
                fontFamily: "'Montserrat', sans-serif",
              }}
              className="p-datatable-sm custom-datatable"
              style={{
                backgroundColor: "#3C3C3C",
                color: "white",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              <Column
                field="rbr"
                header="#"
                headerStyle={{
                  backgroundColor: "#685daa",
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "center", // Center text
                }}
                body={(rowData, options) => options.rowIndex + 1}
                bodyStyle={{
                  paddingLeft: "1rem",
                }}
                style={{
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  height: "3.5rem",
                  paddingLeft: "1rem",
                  width: "2rem",
                }}
              ></Column>

              <Column
                field="name"
                header="Task Name"
                headerStyle={{
                  backgroundColor: "#685daa",
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "center", // Centriraj tekst
                }}
                bodyStyle={{
                  paddingLeft: "1rem",
                }}
                style={{
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  height: "3.5rem",
                  paddingLeft: "1rem",
                  width: "10rem",
                }}
              ></Column>
              <Column
                field="desc"
                header="Task Description"
                headerStyle={{
                  backgroundColor: "#685daa",
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "center",
                  width: "14rem",
                }}
                body={(rowData) => (
                  <>
                    <span
                      id={`tooltip-desc-${rowData.id}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => openModal(rowData.desc)}
                    >
                      {truncateText(rowData.desc || "-")}
                    </span>
                    <Tooltip
                      target={`#tooltip-desc-${rowData.id}`}
                      content="View full description"
                      position="bottom"
                      style={{
                        backgroundColor: "#6c6969",
                        color: "white",
                        width: "10rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        marginLeft: "-0.5rem",
                        marginTop: "0.5rem",
                      }}
                    />
                  </>
                )}
                bodyStyle={{
                  paddingLeft: "0.5rem",
                }}
              ></Column>

              <Column
                field="comment"
                header="Comment"
                headerStyle={{
                  backgroundColor: "#685daa",
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "center",
                  width: "14rem",
                  paddingInlineStart: "1rem",
                }}
                body={(rowData) => (
                  <>
                    <span
                      id={`tooltip-comment-${rowData.id}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => openModal(rowData.comment)}
                    >
                      {truncateText(rowData.comment || "-")}
                    </span>
                    <Tooltip
                      target={`#tooltip-comment-${rowData.id}`}
                      content="View full comment"
                      position="bottom"
                      style={{
                        backgroundColor: "#6c6969",
                        color: "white",
                        width: "10rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        marginLeft: "-0.5rem",
                        marginTop: "0.5rem",
                      }}
                    />
                  </>
                )}
                bodyStyle={{
                  paddingLeft: "1.3rem",
                }}
              ></Column>

              <Column
                field="date"
                header="Task Date"
                headerStyle={{
                  backgroundColor: "#685daa",
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "center",
                  width: "8rem",
                }}
                body={(rowData) => rowData.date || "-"}
                bodyStyle={{
                  paddingLeft: "0.3rem",
                }}
              ></Column>
              <Column
                field="deadline"
                header="Deadline"
                headerStyle={{
                  backgroundColor: "#685daa",
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "center",
                  width: "8rem",
                  paddingInlineStart: "1rem",
                }}
                body={(rowData) => rowData.deadline || "-"}
                bodyStyle={{
                  paddingLeft: "1.2rem",
                  height: "6.5rem",
                }}
              ></Column>
              <Column
                field="state"
                header="State"
                headerStyle={{
                  backgroundColor: "#685daa",
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "center",
                  width: "6rem",
                  paddingInlineStart: "1rem",
                }}
                body={(rowData) =>
                  rowData.state ? stateBodyTemplate(rowData) : "-"
                }
                bodyStyle={{
                  paddingLeft: "1.2rem",
                  height: "4.5rem",
                }}
              ></Column>
              <Column
                field="action"
                header="Actions"
                headerStyle={{
                  backgroundColor: "#685daa",
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "center",
                  width: "6rem",
                  paddingInlineStart: "1rem",
                }}
                body={actionBodyTemplate}
                bodyStyle={{
                  height: "4.5rem",
                }}
              ></Column>
            </DataTable>
          </div>
        )}

        <div className="footer-button-cont">
          <Button className="custom-button" onClick={openPopup}>
            <HiPlus style={{ fontSize: "1.2rem", marginRight: "5px" }} />{" "}
            <span className="ml-2 text-xs">Add Task</span>
          </Button>

          {/* Popup prozor */}
          {isPopupVisible && (
            <div className="popup-overlay">
              <div className="popup-content">
                <p
                  style={{
                    marginTop: "1em",
                    display: "flex",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                  className="add-task-text-popup"
                >
                  ADD NEW TASK
                </p>
                {warningMessage && (
                  <p
                    style={{
                      color: "#FFD700",
                      fontSize: "14px",
                      fontWeight: "bold",
                      position: "absolute",
                      top: "86%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                      opacity: "0.8",
                    }}
                  >
                    {warningMessage}
                  </p>
                )}
                <div className="popup-content-cont">
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
                      value={name_value}
                      className="name-task-input"
                      onChange={(e) => setNameValue(e.target.value)}
                      placeholder="Enter task name"
                    />
                  </div>

                  <div className="name-task-cont">
                    <p
                      style={{
                        marginLeft: "-8em",
                        color: "white",
                        opacity: "0.8",
                      }}
                    >
                      Task Description
                    </p>
                    <InputTextarea
                      autoResize
                      value={desc_value}
                      className="name-task-input"
                      onChange={(e) => setDescValue(e.target.value)}
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
                      value={comment_value}
                      className="name-task-input"
                      onChange={(e) => setCommentValue(e.target.value)}
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
                      value={task_date}
                      onChange={(e) => setTaskDate(e.value)}
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
                      value={deadline}
                      onChange={(e) => setDeadline(e.value)}
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
                <div className="close-button-cont">
                  <Button
                    onClick={saveTask}
                    className="custom-save-button"
                    disabled={isSaveDisabled}
                    style={{
                      opacity: isSaveDisabled ? 0.5 : 1,
                      cursor: isSaveDisabled ? "not-allowed" : "pointer",
                    }}
                  >
                    Save Task
                  </Button>
                  <Button onClick={closePopup} className="custom-close-button">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isEditPopupVisible && (
            <div className="popup-overlay">
              <div className="popup-content-state">
                <h2
                  className="current-state-text"
                  style={{ color: "white", opacity: "0.7" }}
                >
                  Edit Task State
                </h2>
                <p className="current-state-text" style={{ color: "white" }}>
                  Task Name: <strong>{editingTask?.name || "-"}</strong>
                </p>
                <p
                  className="current-state-text"
                  style={{
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  Current State: <strong>{editingTask?.state || "-"}</strong>
                  {editingTask?.state && (
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor:
                          states.find((s) => s.name === editingTask.state)
                            ?.color || "gray",
                      }}
                    ></span>
                  )}
                </p>

                <Dropdown
                  value={newState}
                  options={states}
                  onChange={(e) => setNewState(e.value)}
                  optionLabel="name"
                  placeholder="Select a new State"
                  className="custom-dropdown-state"
                  style={{ width: "100%", marginTop: "1rem" }}
                  itemTemplate={(option) => (
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
                  )}
                  valueTemplate={(option) =>
                    option ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: "1rem",
                        }}
                      >
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
                    ) : (
                      <span style={{ color: "gray" }}>Select a new State</span>
                    )
                  }
                />

                <div
                  style={{
                    marginTop: "10.5rem",
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "end",
                  }}
                >
                  <Button
                    onClick={updateTaskState}
                    className="custom-save-button-sate"
                    style={{ backgroundColor: "green", color: "white" }}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditPopupVisible(false)}
                    className="custom-close-button-state"
                    style={{ backgroundColor: "red", color: "white" }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          {isModalVisible && (
            <div className="popup-overlay">
              <div className="popup-content-comment-desc">
                <p
                  className="fullContent-text"
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  Full Content
                </p>
                <div className="fullContent-content-main-text">
                  {" "}
                  <p
                    className="fullContent-text-main"
                    style={{ marginTop: "3em", fontSize: "16px" }}
                  >
                    {fullText}
                  </p>
                </div>

                <div className="button-fullContent-cont">
                  {" "}
                  <Button
                    onClick={closeModal}
                    className="custom-close-button"
                    style={{ marginTop: "20px" }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default Home;
