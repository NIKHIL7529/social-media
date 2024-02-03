import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
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
    console.log("Handling Login...");
    e.preventDefault();
    fetch("https://social-media-backend-d246.onrender.com/api/user/login", {
      method: "POST",
      body: JSON.stringify(formData),
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
          console.log("Login Successful");
          navigate("/Home");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));

    console.log("Login data:", formData);
  };

  return (
    <div className={styles.Login}>
      <div className={styles.formContainer}>
        <button onClick={() => navigate("/signup")}>Signup</button>
        <h2>Login</h2>
        <form>
          <input
            type="text"
            name="name"
            placeholder="Username"
            value={formData.name}
            onChange={handleInputChange}
          />
          {/* <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          /> */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <button onClick={handleLogin}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
