import React, { useState } from "react";
import "../css_files/SignUp.css";

import { Button } from "flowbite-react";
import { HiMail, HiLockClosed, HiUser } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
// import { collection, addDoc, getDocs } from "firebase/firestore";
// import { db } from "../backend/firebase";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../backend/firebase";
const SignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Funkcija za generiranje ID-a
  const generateUserId = async () => {
    const usersSnapshot = await getDocs(collection(db, "sign_in"));
    const userCount = usersSnapshot.size;
    return userCount + 1; // Generira ID na temelju broja korisnika
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const id = await generateUserId();
      const userDoc = {
        id,
        full_name: fullName,
        username,
        email,
        password,
      };
  
      await addDoc(collection(db, "sign_in"), userDoc);
  
      // Spremi korisničke podatke u localStorage
      localStorage.setItem("currentUser", JSON.stringify({ id, fullName }));
  
      console.log("User successfully added!");
      navigate("/default_screen/home");
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };
  

  return (
    <div className="main_container">
      <div className="right_main_cont_signUp">
        <div className="header_text_cont">
          <h1 className="header_text">Sign Up To TaskFlow account</h1>
        </div>
        <div className="link_text_cont">
          <p className="link_text1">Already have an account?</p>
          <a className="link_text2" onClick={() => navigate("/signin")}>
            Sign in
          </a>
        </div>
        <div className="input_cont">
          <div
            style={{
              position: "relative",
              width: "30em",
              marginBottom: "1rem",
            }}
          >
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              style={{
                width: "100%",
                height: "3.5rem",
                background: "#1E1E1E",
                border: "1px solid #1E1E1E",
                fontSize: "1.15rem",
                color: "white",
                padding: "0 3rem 0 1.5rem",
                borderRadius: "50px",
              }}
              required
            />
            <HiUser
              style={{
                position: "absolute",
                right: "1.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                opacity: "0.5",
                fontSize: "1.3rem",
              }}
            />
          </div>
          <div
            style={{
              position: "relative",
              width: "30em",
              marginBottom: "1rem",
            }}
          >
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              style={{
                width: "100%",
                height: "3.5rem",
                background: "#1E1E1E",
                border: "1px solid #1E1E1E",
                fontSize: "1.15rem",
                color: "white",
                padding: "0 3rem 0 1.5rem",
                borderRadius: "50px",
              }}
              required
            />
            <HiUser
              style={{
                position: "absolute",
                right: "1.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                opacity: "0.5",
                fontSize: "1.3rem",
              }}
            />
          </div>
          <div
            style={{
              position: "relative",
              width: "30em",
              marginBottom: "1rem",
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: "100%",
                height: "3.5rem",
                background: "#1E1E1E",
                border: "1px solid #1E1E1E",
                fontSize: "1.15rem",
                color: "white",
                padding: "0 3rem 0 1.5rem",
                borderRadius: "50px",
              }}
              required
            />
            <HiMail
              style={{
                position: "absolute",
                right: "1.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                opacity: "0.5",
                fontSize: "1.3rem",
              }}
            />
          </div>
          <div style={{ position: "relative", width: "30em" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: "100%",
                height: "3.5rem",
                background: "#1E1E1E",
                border: "1px solid #1E1E1E",
                fontSize: "1.15rem",
                color: "white",
                padding: "0 3rem 0 1.5rem",
                borderRadius: "50px",
              }}
              required
            />
            <HiLockClosed
              style={{
                position: "absolute",
                right: "1.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                opacity: "0.5",
                fontSize: "1.3rem",
              }}
            />
          </div>
          <div style={{ position: "relative", width: "30em" }}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              style={{
                width: "100%",
                height: "3.5rem",
                background: "#1E1E1E",
                border: "1px solid #1E1E1E",
                fontSize: "1.15rem",
                color: "white",
                padding: "0 3rem 0 1.5rem",
                borderRadius: "50px",
                marginTop: "1em",
              }}
              required
            />
            <HiLockClosed
              style={{
                position: "absolute",
                right: "1.5rem",
                top: "65%",
                transform: "translateY(-50%)",
                color: "white",
                opacity: "0.5",
                fontSize: "1.3rem",
              }}
            />
          </div>
          <div>
            <Button
              type="button"
              onClick={handleSignUp}
              style={{
                backgroundColor: "#3B0F75",
                color: "white",
                width: "15em",
                height: "3.5rem",
                borderRadius: "50px",
                fontSize: "2rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="button"
            >
              Sign Up to TaskFlow
            </Button>
          </div>
        </div>
      </div>
      <div
        className="left_main_cont_signUp"
        style={{
          backgroundImage: `url(${require("../assets/slika_login.jpg")})`,
          backgroundSize: "cover", // Pokriva cijeli container
          backgroundPosition: "center", // Postavlja sliku u centar
          opacity: "0.5",
        }}
      ></div>
    </div>
  );
};

export default SignUp;
