import React from "react";
import { useLocation } from "react-router-dom";
import "../css_files/Sidebar.css";
import { Sidebar } from "primereact/sidebar";

const SidebarCustom = ({ navigate }) => {
  const location = useLocation(); // Dohvaća trenutnu rutu

  const isActive = (path) => location.pathname === path; // Provjerava je li ruta aktivna

  return (
    <div className="card flex" style={{ height: "100vh" }}>
      <Sidebar
        visible={true}
        onHide={() => console.log("Sidebar closed")}
        style={{
          backgroundColor: "#181818",
          width: "20em",
        }}
        modal={false}
        showCloseIcon={false}
      >
        <div className="logo-text-cont">
          <h3 className="logo-text">TaskFlow</h3>
          <img
            src={require("../assets/logoTaskFlow.png")}
            alt="TaskFlow Logo"
            style={{ width: "50px", height: "50px", opacity: "0.6" }}
          />
        </div>
        <div className="main-sidebar-cont">
          <div
            className="home_sideBar"
            onClick={() => navigate("/default_screen/home")}
          >
            <img
              src={require("../assets/home_taskFlow.png")}
              alt="TaskFlow Logo"
              style={{ width: "30px", height: "30px", opacity: "0.6" }}
            />
            <p
              className="sidebar-text"
              style={{
                fontWeight: isActive("/default_screen/home") ? "900" : "normal",
              }}
            >
              HOME
            </p>
          </div>
          <div
            className="calendar_sideBar"
            onClick={() => navigate("/default_screen/task_details")}
          >
            <img
              src={require("../assets/editing.png")}
              alt="TaskFlow Logo"
              style={{ width: "30px", height: "30px", opacity: "0.6" }}
            />
            <p
              className="sidebar-text"
              style={{
                fontWeight: isActive("/default_screen/task_details")
                  ? "bold"
                  : "normal",
              }}
            >
              TASK DETAILS AND EDITING
            </p>
          </div>
          <div
            className="calendar_sideBar"
            onClick={() => navigate("/default_screen/calendar")}
          >
            <img
              src={require("../assets/calendar.png")}
              alt="TaskFlow Logo"
              style={{ width: "30px", height: "30px", opacity: "0.6" }}
            />
            <p
              className="sidebar-text"
              style={{
                fontWeight: isActive("/default_screen/calendar")
                  ? "bold"
                  : "normal",
              }}
            >
              CALENDAR
            </p>
          </div>
          <div
            className="calendar_sideBar"
            onClick={() => navigate("/default_screen/analytics")}
          >
                <img
              src={require("../assets/analytics.png")}
              alt="TaskFlow Logo"
              style={{ width: "30px", height: "30px", opacity: "0.6" }}
            />
            <p
              className="sidebar-text"
              style={{
                fontWeight: isActive("/default_screen/analytics")
                  ? "bold"
                  : "normal",
              }}
            >
              ANALYTICS
            </p>
          </div>
          <div className="breaker"></div>
        </div>
        <div className="main-sidebar-cont-footer">
          <div
            className="calendar_sideBar-settings"
            onClick={() => navigate("/default_screen/settings")}
          >
                <img
              src={require("../assets/settings_taskFlow.png")}
              alt="TaskFlow Logo"
              style={{ width: "30px", height: "30px", opacity: "0.6" }}
            />
            <p
              className="sidebar-text"
              style={{
                fontWeight: isActive("/default_screen/settings")
                  ? "bold"
                  : "normal",
              }}
            >
              SETTINGS
            </p>
          </div>
          <div className="breaker-new"></div>
          <div
            className="calendar_sideBar-logOut"
            onClick={() => navigate("/signin")}
          >
                <img
              src={require("../assets/exit_taskFlow.png")}
              alt="TaskFlow Logo"
              style={{ width: "30px", height: "30px", opacity: "0.6" }}
            />
            <p className="sidebar-text-logOut">LOG OUT</p>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default SidebarCustom;
