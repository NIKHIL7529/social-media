import styles from "./SideBar.module.css";
import { Link } from "react-router-dom";
import Home from "@mui/icons-material/Home";
import Search from "@mui/icons-material/Search";
import Chat from "@mui/icons-material/Message";
import Person from "@mui/icons-material/AccountCircle";
import Settings from "@mui/icons-material/Settings";
// import FeedIcon from "@mui/icons-material/Feed";
import { AddCircleOutline } from "@mui/icons-material";

export default function SideBar() {
  return (
    <div className={styles.SideBar}>
      <div className={styles.links}>
        {/* <Link  to="/home">
          <div className={styles.sidelink}>
            <Home />
            <p></p>
          </div>
        </Link> */}
        <Link to="/posts">
          <div className={styles.sidelink}>
            <Home />
            <p className={styles.linkP}>Home</p>
          </div>
        </Link>
        <Link to="/search">
          <div className={styles.sidelink}>
            <Search />
            <p>Search</p>
          </div>
        </Link>
        <Link to="/chat">
          <div className={styles.sidelink}>
            <Chat sx={{ stroke: "#fff" }} />
            <p>Messages</p>
          </div>
        </Link>
        {/* <Link to="/addPost">
          <div className={styles.sidelink}>
            <AddCircleOutline />
            <p>Create Post</p>
          </div>
        </Link> */}
        <Link to="/profile">
          <div className={styles.sidelink}>
            <Person />
            <p>Profile</p>
          </div>
        </Link>
        <Link to="/settings">
          <div className={styles.sidelink}>
            <Settings />
            <p>Settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
