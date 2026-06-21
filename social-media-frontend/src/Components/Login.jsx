import { Link, useLocation, useNavigate } from "react-router";
import styles from "./Login.module.css";
import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import Swal from "sweetalert2";

const Login = ({ setUser, isAuthenticated, authChecked }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/posts";

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authChecked, isAuthenticated, navigate, redirectTo]);

  // const [submit, setSubmit] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Handling Login...");
    if (formData.name !== "" && formData.password.length !== 0) {
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
        .login(formData)
        .then((data) => {
          Swal.close();
          console.log("Fetch response received: ", data);
          if (data.status === 200) {
            console.log("Login Successful");
            setUser(data.user);
            navigate(redirectTo, { replace: true });
          }
          if (data.status === 400) {
            console.log("incomplete");
            console.log(data);
            // setSubmit(false);
            Swal.fire({
              icon: "warning",
              title: "Incorrect Credentials",
              showConfirmButton: false,
            });
          }
          if (data.status === 500) {
            console.log("false");
            console.log(data);
            // setSubmit("false");
            Swal.fire({
              text: "Internal server error",
              showConfirmButton: false,
            });
          }
        })
        .catch((error) => {
          Swal.close();
          Swal.fire({
            icon: error.status === 400 ? "warning" : "error",
            title:
              error.status === 400
                ? "Incorrect credentials"
                : "Unable to sign in",
            text:
              error.status === 400
                ? "Check your username and password."
                : "Please try again shortly.",
          });
        });
    } else {
      console.log("incomplete");
      // setSubmit("incomplete");
      Swal.fire({
        icon: "warning",
        title: "Username and Password are required",
        showConfirmButton: false,
      });
    }

    console.log("Login data:", formData);
  };

  return (
    <div className={styles.Login}>
      <div className={styles.box}>
        <h2>Login</h2>
        <form>
          <div className={styles.inputBox}>
            <input
              id="user-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="user-name">Username</label>
          </div>
          <div className={styles.inputBox}>
            <input
              id="user-pass"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="user-pass">Password</label>
          </div>
          <input
            id="submit"
            type="submit"
            value="Login"
            onClick={handleLogin}
          />
        </form>
        <div className={styles.signup}>
          <p>
            Not Registered? <Link to="/signup">Create an Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

