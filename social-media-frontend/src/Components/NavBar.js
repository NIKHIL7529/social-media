import styles from "./NavBar.module.css";
import Notifications from "@mui/icons-material/Notifications";
import BookmarkBorder from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import Logout from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../Utils/backendUrl";
import Swal from "sweetalert2";

export default function NavBar({ setUser }) {
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

  return (
    <div className={styles.NavBar}>
      <div className={styles.appName}>
        <Link to="/posts">
          <div className={styles.appP}>Chatz</div>
        </Link>
      </div>
      <div className={styles.endNav}>
        <div className={styles.svgNav}>
          <div className={styles.svgNavIcon}>
            <Link className={styles.link} to="/posts">
              <Notifications />
            </Link>
          </div>
          <div
            className={styles.svgNavIcon}
            onClick={() => navigate("/savedPosts")}
          >
            {/* <Link className={styles.link} to="/posts"> */}
            <BookmarkBorder />
            {/* </Link> */}
          </div>
        </div>
        <div className={styles.logout} onClick={handleLogout}>
          <div className={styles.logoutP}>
            Logout
            <Logout className={styles.logoutsvg} />
          </div>
        </div>
      </div>
    </div>
  );
}
