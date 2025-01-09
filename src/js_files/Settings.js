import React, { useState, useEffect } from "react";
import "../css_files/Settings.css";
import { InputText } from "primereact/inputtext";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../backend/firebase";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";



const Settings = () => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [userData, setUserData] = useState({
    full_name: "",
    email: "",
    username: "",
  });

  const [isEmailPopupVisible, setEmailPopupVisible] = useState(false);
  const [isUsernamePopupVisible, setUsernamePopupVisible] = useState(false);
  const [isPasswordPopupVisible, setPasswordPopupVisible] = useState(false);
  const [updatedValue, setUpdatedValue] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const fetchUserData = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      if (!currentUser || !currentUser.id) {
        console.error("User is not logged in or missing ID.");
        return;
      }

      console.log(`Fetching user data for ID: ${currentUser.id}`);

      const querySnapshot = await getDocs(collection(db, "sign_in"));
      let foundUser = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id === currentUser.id) {
          foundUser = { ...data, docId: doc.id };
        }
      });

      if (foundUser) {
        console.log("User data found:", foundUser);
        setUserData({
          full_name: foundUser.full_name || "",
          email: foundUser.email || "",
          username: foundUser.username || "",
          password: foundUser.password || "", 
          docId: foundUser.docId, 
        });
      } else {
        console.error("No user data found for the given ID.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
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

  const openEmailPopup = () => {
    setUpdatedValue(userData.email);
    setEmailPopupVisible(true);
  };
  const closeEmailPopup = () => setEmailPopupVisible(false);

  const openUsernamePopup = () => {
    setUpdatedValue(userData.username);
    setUsernamePopupVisible(true);
  };
  const closeUsernamePopup = () => setUsernamePopupVisible(false);

  const openPasswordPopup = () => {
    setPasswordPopupVisible(true);
  };
  const closePasswordPopup = () => {
    setPasswordPopupVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handleSave = async (field) => {
    if (!userData.docId) {
      console.error("No document ID found for the user.");
      return;
    }

    const userDocRef = doc(db, "sign_in", userData.docId);

    try {
      await updateDoc(userDocRef, {
        [field]: updatedValue,
      });
      console.log(`${field} updated successfully`);

      // Ažuriramo lokalno stanje
      setUserData((prevState) => ({
        ...prevState,
        [field]: updatedValue,
      }));

      // Zatvaramo odgovarajući popup
      if (field === "email") {
        closeEmailPopup();
      } else if (field === "username") {
        closeUsernamePopup();
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const handlePasswordChange = async () => {
    if (currentPassword !== userData.password) {
      console.log("Entered password:", currentPassword);
      console.log("Stored password:", userData.password);
      setPasswordError("Current password is incorrect.");
      return;
    }
    if (currentPassword.trim() !== userData.password.trim()) {
      setPasswordError("Current password is incorrect.");
      return;
    }
    
    

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (!userData.docId) {
      console.error("No document ID found for the user.");
      return;
    }

    const userDocRef = doc(db, "sign_in", userData.docId);

    try {
      await updateDoc(userDocRef, {
        password: newPassword,
      });
      console.log("Password updated successfully");

      // Ažuriramo lokalno stanje
      setUserData((prevState) => ({
        ...prevState,
        password: newPassword,
      }));

      closePasswordPopup();
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  return (
    <>
      <p className="profile-header-text">My Profile</p>
      <div className="line"></div>
      <p className="profile-basicInfo-text">Basic info</p>
      <div className="fullName-settings-cont">
        <p>Full Name</p>
        <InputText
          readOnly
          className="fullname-settings-input"
          value={userData.full_name}
        />
      </div>
      <div className="fullName-settings-cont">
        <p>Email</p>
        <div className="cont">
          <InputText
            readOnly
            className="fullname-settings-input"
            value={userData.email}
          />
          <Button onClick={openEmailPopup} className="update-button">
            Update
          </Button>
        </div>
      </div>
      <div className="fullName-settings-cont">
        <p>User Name</p>
        <div className="cont">
          {" "}
          <InputText
            readOnly
            className="fullname-settings-input"
            value={userData.username}
          />
          <Button onClick={openUsernamePopup} className="update-button">
            Update
          </Button>
        </div>
      </div>
      <div className="line"></div>
      <div className="changepass-cont">  <Button onClick={openPasswordPopup} className="change-button" label="Change password"></Button></div>
      <div className="line"></div>
      <div className="changepass-cont">  <Button onClick={() => navigate("/signin")} className="pass-button" label="Log Out"></Button></div>

    

      {/* Popup for Email */}
      {isEmailPopupVisible && (
        <div className="popup-overlay">
          <div className="popup-content-email">
            <h2 className="update-email-text">Update Email</h2>
            <InputText
              value={updatedValue}
              onChange={(e) => setUpdatedValue(e.target.value)}
              className="popup-input"
            />
            <div className="popup-buttons">
              <Button
                className="custom-save-button"
                onClick={() => handleSave("email")}
              >
                Save
              </Button>
              <Button
                className="custom-close-button"
                onClick={closeEmailPopup}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup for Username */}
      {isUsernamePopupVisible && (
        <div className="popup-overlay">
          <div className="popup-content-email">
            <h2 className="update-email-text">Update Username</h2>
            <InputText
              value={updatedValue}
              onChange={(e) => setUpdatedValue(e.target.value)}
              className="popup-input"
            />
            <div className="popup-buttons">
              <Button
                className="custom-save-button"
                onClick={() => handleSave("username")}
              >
                Save
              </Button>
              <Button
                className="custom-close-button"
                onClick={closeUsernamePopup}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
       {/* Popup for Password */}
       {isPasswordPopupVisible && (
        <div className="popup-overlay">
          <div className="popup-content-pass">
            <h2 className="update-email-text">Change Password</h2>
            {passwordError && <p className="error-text">{passwordError}</p>}
            <InputText
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="popup-input"
            />
            <InputText
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="popup-input"
            />
            <InputText
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="popup-input"
            />
            <div className="popup-buttons-pass">
              <Button
                className="custom-save-button"
                onClick={handlePasswordChange}
              >
                Save
              </Button>
              <Button
                className="custom-close-button"
                onClick={closePasswordPopup}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Settings;
