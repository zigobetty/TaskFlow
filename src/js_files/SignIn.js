import React, { useState, useRef } from "react";
import "../css_files/SignIn.css";
import { Button } from "flowbite-react";
import { HiMail, HiLockClosed } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../backend/firebase";
import { Toast } from "primereact/toast";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";


const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useRef(null); // Referenca za Toast

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail: "Email and password are required",
        life: 3000,
        className: "custom-toast custom-toast-warn",
      });
      return;
    }
  
    try {
      const usersRef = collection(db, "sign_in");
      const q = query(usersRef, where("email", "==", email), where("password", "==", password));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Dohvati podatke korisnika
        const userDoc = querySnapshot.docs[0].data();
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ id: userDoc.id, fullName: userDoc.full_name })
        );
  
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `Welcome ${userDoc.full_name}`,
          life: 3000,
          className: "custom-toast custom-toast-success",
        });
  
        navigate("/default_screen/home");
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Invalid email or password",
          life: 3000,
          className: "custom-toast custom-toast-warn",
        });
      }
    } catch (err) {
      console.error("Error during sign in: ", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred during sign in. Please try again.",
        life: 3000,
        className: "custom-toast custom-toast-warn",
      });
    }
  };
  
  
  

  return (
    <div className="main_container">
      <Toast ref={toast} /> {/* Toast komponenta */}
      <div
        className="left_main_cont"
        style={{
          backgroundImage: `url(${require("../assets/slika4.jpg")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: "0.5",
        }}
      ></div>

      <div className="right_main_cont">
        <div className="header_text_cont">
          <h1 className="header_text">Sign In to your TaskFlow account</h1>
        </div>
        <div className="link_text_cont">
          <p className="link_text1">Don't have an account ?</p>
          <a className="link_text2" onClick={() => navigate("/")}>
            Sign up
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              style={{
                width: "100%",
                height: "3.5rem",
                background: "#1E1E1E",
                border: "1px solid #1E1E1E",
                fontSize: "1.15rem",
                color: "white",
                padding: "0 3rem 0 1.5rem",
                boxSizing: "border-box",
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
                pointerEvents: "none",
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
              placeholder="password"
              style={{
                width: "100%",
                height: "3.5rem",
                background: "#1E1E1E",
                border: "1px solid #1E1E1E",
                fontSize: "1.15rem",
                color: "white",
                padding: "0 3rem 0 1.5rem",
                boxSizing: "border-box",
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
                pointerEvents: "none",
                opacity: "0.5",
                fontSize: "1.3rem",
              }}
            />
          </div>
          <div>
            <Button
              type="submit"
              onClick={handleSignIn}
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
              Sign In to TaskFlow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
