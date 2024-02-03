import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    password: "",
    city: "",
    country: "",
    description: "",
    photo: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevData) => ({
          ...prevData,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();

    console.log(formData);
    console.log("hi");
    console.log("Handling Signup...");

    fetch("http://localhost:8000/api/user/signup", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetch response received: ", data);
        if (data.status === 200) {
          console.log("Registered Successfully");
          navigate("/login");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  return (
    <div className={styles.Signup}>
      <div className={styles.formContainer}>
        <button onClick={() => navigate("/login")}>Login</button>
        <h2>Sign Up</h2>
        <form>
          <div className={styles.formGroup}>
            <label>
              <img src={formData.photo} alt="" />
            </label>
            <input
              type="file"
              name="photo"
              placeholder="Photo"
              onChange={handleInputImage}
              accept="image/*"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              name="name"
              placeholder="Username"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>DOB</label>
            <input
              type="date"
              name="dob"
              placeholder="DOB"
              value={formData.dob}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>City</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Country</label>
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Gender</label>
            <input
              type="text"
              name="gender"
              placeholder="Gender"
              value={formData.gender}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          {/* <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          /> */}

          <button onClick={handleSignup}>Sign Up</button>
        </form>
      </div>
    </div>
  );
}
