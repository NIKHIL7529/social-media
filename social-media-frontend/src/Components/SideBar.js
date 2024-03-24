import styles from "./SideBar.module.css";
import { Link } from "react-router-dom";
import Home from "@mui/icons-material/Home";
import Diversity2 from "@mui/icons-material/Diversity2";
import Search from "@mui/icons-material/Search";
import Chat from "@mui/icons-material/Message";
import Person from "@mui/icons-material/AccountCircle";
import Settings from "@mui/icons-material/Settings";
import FeedIcon from "@mui/icons-material/Feed";

export default function SideBar({ menu }) {
  return (
    <div
      className={styles.SideBar}
      style={
        menu
          ? { display: "block" }
          : { maxWidth: "1024px" && { display: "none" } }
      }
    >
      <div className={styles.links}>
        {/* <Link className={styles.link} to="/home">
          <div className={styles.sidelink}>
            <Home />
            <p className={styles.linkP}>Home</p>
          </div>
        </Link> */}
        <Link className={styles.link} to="/posts">
          <div className={styles.sidelink}>
            <FeedIcon />
            <p className={styles.linkP}>Posts</p>
          </div>
        </Link>
        <Link className={styles.link} to="/search">
          <div className={styles.sidelink}>
            <Search />
            <p className={styles.linkP}>Search</p>
          </div>
        </Link>
        <Link className={styles.link} to="/chat">
          <div className={styles.sidelink}>
            <Chat sx={{ stroke: "#fff" }} />
            <p className={styles.linkP}>Messages</p>
          </div>
        </Link>
        <Link className={styles.link} to="/profile">
          <div className={styles.sidelink}>
            <Person />
            <p className={styles.linkP}>Profile</p>
          </div>
        </Link>
        <Link className={styles.link} to="/settings">
          <div className={styles.sidelink}>
            <Settings />
            <p className={styles.linkP}>Settings</p>
          </div>
        </Link>
        {/* <Link className={styles.link} to="/login">
          <div className={styles.sidelink}>
            <Settings />
            <p className={styles.linkP}>Login</p>
          </div>
        </Link> */}
      </div>
    </div>
  );
}
