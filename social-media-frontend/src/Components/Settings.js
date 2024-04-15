import { useNavigate } from "react-router-dom";
import styles from "./Settings.module.css";
import { backendUrl } from "../Utils/backendUrl";
import Swal from "sweetalert2";

export default function Settings({ setUser }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    Swal.fire({
      width: "120",
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
    });
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
        Swal.close();
        console.log("Fetch response received: ", data);
        if (data.status === 200 || data.status === 401) {
          console.log("Search Successful");
          setUser(null);
          navigate("/login", { state: "true" });
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
      <div onClick={handleSwitchUser}>Switch Profile</div>
      <div onClick={handleLogout}>Logout</div>
    </div>
  );
}
