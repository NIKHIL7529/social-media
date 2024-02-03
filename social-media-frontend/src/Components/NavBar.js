import styles from "./NavBar.module.css";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";

export default function NavBar() {
  return (
    <div className={styles.NavBar}>
      <p>Chatz</p>
      <div>
        <NotificationsOutlinedIcon />
        <BookmarkBorderOutlinedIcon />
      </div>
    </div>
  );
}
