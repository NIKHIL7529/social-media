import styles from "./SideBar.module.css";
import { NavLink } from "react-router";
import Home from "@mui/icons-material/Home";
import Search from "@mui/icons-material/Search";
import Chat from "@mui/icons-material/Message";
import Person from "@mui/icons-material/AccountCircle";
import Settings from "@mui/icons-material/Settings";
// import FeedIcon from "@mui/icons-material/Feed";

export default function SideBar() {
  const navigation = [
    { to: "/posts", label: "Home", icon: Home },
    { to: "/search", label: "Search", icon: Search },
    { to: "/chat", label: "Messages", icon: Chat },
    { to: "/profile", label: "Profile", icon: Person },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className={styles.SideBar} aria-label="Primary navigation">
      <div className={styles.links}>
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? styles.activeLink : "")}
          >
            <div className={styles.sidelink}>
              <Icon />
              <p>{label}</p>
            </div>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

