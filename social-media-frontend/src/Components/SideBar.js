import styles from "./SideBar.module.css";
import { Link } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Diversity2OutlinedIcon from "@mui/icons-material/Diversity2Outlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export default function SideBar() {
  return (
    <div className={styles.SideBar}>
      <Link to="/home">
        <p>
          <HomeOutlinedIcon />
          Home
        </p>
      </Link>
      <Link to="/posts">
        <p>
          <Diversity2OutlinedIcon />
          Posts
        </p>
      </Link>
      <Link to="/search">
        <p>
          <SearchOutlinedIcon />
          Search
        </p>
      </Link>
      {/* <Link to="/chat">
        <p>
          <ChatOutlinedIcon />
          Messages
        </p>
      </Link> */}
      <Link to="/profile">
        <p>
          <PersonOutlinedIcon />
          Profile
        </p>
      </Link>
      <Link to="/settings">
        <p>
          <SettingsOutlinedIcon />
          Settings
        </p>
      </Link>
      <Link to="/login">
        <p>
          <SettingsOutlinedIcon />
          Login
        </p>
      </Link>
    </div>
  );
}
