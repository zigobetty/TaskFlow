import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../css_files/Default_screen.css";
import SidebarCustom from "./Sidebar";

const DefaultScreen = () => {
  const navigate = useNavigate(); 

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SidebarCustom navigate={navigate} />
      <div style={{ flex: 1, paddingRight:"1em", paddingLeft:"22em", paddingTop:"2em" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default DefaultScreen;
