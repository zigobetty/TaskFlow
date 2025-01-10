import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./js_files/SignIn";
import SignUp from "./js_files/SignUp";
import Home from "./js_files/Home";
import Calendar from "./js_files/Calendar";
import TaskDetails from "./js_files/TaskDetails";
import DefaultScreen from "./js_files/Default_screen";
import Analytics from "./js_files/Analytics";
import Settings from "./js_files/Settings";
import app from "./backend/firebase";

function App() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.75,
    height: window.innerHeight * 0.75,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.75,
        height: window.innerHeight * 0.75,
      });
    };

    // Postavi dimenzije pri prvom učitavanju
    handleResize();

    // Osluškuj promene veličine prozora
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const appContainerStyle = {
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
   
  };

  return (
    <div style={appContainerStyle}>
      <BrowserRouter>
        <Routes>
          {/* Rute bez sidebara */}
          <Route path="/" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          {/* DefaultScreen layout */}
          <Route path="/default_screen/*" element={<DefaultScreen />}>
            <Route index element={<Home />} /> {/* Početni sadržaj */}
            <Route path="home" element={<Home />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="task_details" element={<TaskDetails />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
