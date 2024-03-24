import styles from "./NavBar.module.css";
import Notifications from "@mui/icons-material/Notifications";
import BookmarkBorder from "@mui/icons-material/Bookmark";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Logout from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../Utils/backendUrl";
import { useState } from "react";

export default function NavBar({ setUser, menu, setMenu }) {
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

  const handleSideBar = () => {
    setMenu((prevMenu) => !prevMenu);
  };

  return (
    <div className={styles.NavBar}>
      <div className={styles.appName}>
        <div className={styles.menu} onClick={handleSideBar}>
          {menu ? <CloseIcon /> : <MenuIcon />}
        </div>
        <Link className={styles.link} to="/home">
          <div className={styles.appP}>Chatz</div>
        </Link>
      </div>
      <div className={styles.endNav}>
        <div className={styles.svgNav}>
          <div className={styles.svgNavIcon}>
            <Link className={styles.link} to="/notifications">
              <Notifications />
            </Link>
          </div>
          <div className={styles.svgNavIcon}>
            <Link className={styles.link} to="/saved">
              <BookmarkBorder />
            </Link>
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
