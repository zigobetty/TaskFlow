import React from "react";
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
  return (
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
  );
}

export default App;
