import styles from "./NavBar.module.css";
import { AddCircle } from "@mui/icons-material";
import BookmarkBorder from "@mui/icons-material/Bookmark";
import Logout from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router";
import { authService } from "../services/authService";
import Swal from "sweetalert2";

export default function NavBar({ setUser, isAuthenticated }) {
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
    authService
      .logout()
      .then((data) => {
        Swal.close();
        console.log("Fetch response received: ", data);
        if (data.status === 200) {
          console.log("Search Successful");
          setUser(null);
          navigate("/login", { replace: true });
        }
      })
      .catch(() => {
        Swal.close();
        setUser(null);
        navigate("/login", { replace: true });
      });
  };

  return (
    <div className={styles.NavBar}>
      <div className={styles.appName}>
        <Link to="/posts">
          <div className={styles.appP}>SocialSphere</div>
        </Link>
      </div>
      <div className={styles.endNav}>
        {isAuthenticated ? (
          <>
            <div className={styles.svgNav}>
              <div className={styles.svgNavIcon}>
                <Link className={styles.link} to="/addPost" title="Create post">
                  <AddCircle />
                </Link>
              </div>
              <div
                className={styles.svgNavIcon}
                onClick={() => navigate("/savedPosts")}
              >
                <BookmarkBorder />
              </div>
            </div>
            <div className={styles.logout} onClick={handleLogout}>
              <div className={styles.logoutP}>
                Logout
                <Logout className={styles.logoutsvg} />
              </div>
            </div>
          </>
        ) : (
          <div className={styles.logout}>
            <div className={styles.logoutP} onClick={() => navigate("/login")}>
              Login
            </div>
            <div
              className={styles.logoutP}
              onClick={() => navigate("/signup")}
            >
              Signup
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
