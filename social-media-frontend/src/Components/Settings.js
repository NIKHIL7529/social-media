import { useNavigate } from "react-router-dom";
import styles from "./Settings.module.css";

export default function Settings() {
  const navigate = useNavigate();
  const handleLogout = () => {
    fetch("https://social-media-backend-d246.onrender.com/api/user/logout", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      withCredentials: true,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetch response received: ", data);
        if (data.status === 200) {
          console.log("Search Successful");
          navigate("/login");
        }
      });
  };

  return (
    <div className={styles.Settings}>
      <p>Manage Account</p>
      <p>Theme</p>
      <p>Create New Account</p>
      <p onClick={handleLogout}>Logout</p>
    </div>
  );
}
