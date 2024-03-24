import { useNavigate } from "react-router-dom";
import styles from "./Settings.module.css";
import { backendUrl } from "../Utils/backendUrl";

export default function Settings({ setUser }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    fetch(`${backendUrl}/api/user/logout`, {
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
          setUser(null);
          navigate("/login");
        }
      });
  };

  const handleSwitchUser = () => {
    navigate("/login", { state: "true" });
  };

  return (
    <div className={styles.Settings}>
      {/* <p>Manage Account</p> */}
      {/* <p>Theme</p> */}
      <div onClick={() => navigate("/signup")}>Create New Account</div>
      <div onClick={handleSwitchUser}>Switch User</div>
      <div onClick={handleLogout}>Logout</div>
    </div>
  );
}
