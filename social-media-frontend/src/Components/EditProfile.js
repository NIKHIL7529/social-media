import { useState } from "react";
import { backendUrl } from "../Utils/backendUrl";
import styles from "./EditProfile.module.css";
import { useNavigate } from "react-router-dom";
import image from "../images/user.jpg";
import Swal from "sweetalert2";

export default function EditProfile() {
  const navigate = useNavigate();

  // const [submit, setSubmit] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "male",
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
    if (
      formData.dob !== "" &&
      formData.gender !== "" &&
      formData.name !== "" &&
      formData.name.length <= 20 &&
      formData.password !== "" &&
      formData.password.length >= 8
    ) {
      console.log(formData);
      console.log("hi");
      console.log("Handling Edit Profile...");
      Swal.fire({
        width: "120",
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2000,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      fetch(`${backendUrl}/api/user/editProfile`, {
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
          Swal.close();
          console.log("Fetch response received: ", data);
          if (data.status === 200) {
            console.log("Registered Successfully");
            navigate("/profile");
          }
          if (data.status === 400) {
            // setSubmit("exists");
            Swal.fire({
              icon: "warning",
              title: "User already exists",
              showConfirmButton: false,
            });
          }
          if (data.status === 500) {
            // setSubmit("false");
            Swal.fire({
              icon: "warning",
              title: "Internal server error",
              showConfirmButton: false,
            });
          }
        })
        .catch((err) => console.log("Error during fetch: ", err));
    } else {
      // setSubmit("incomplete");
      Swal.fire({
        icon: "warning",
        title: "All fields are required",
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className={styles.EditProfile}>
      <div className={styles.box}>
        <h2>Edit Profile</h2>
        <form>
          <div className={styles.inputBox}>
            <label htmlFor="image">
              <img src={formData.photo ? formData.photo : image} alt="" />
              <div className={styles.imageOverlay}>
                <div>
                  <i className="fa fa-camera fa-2x"></i>
                </div>
                <div>
                  Add <br /> Profile Photo
                </div>
              </div>
            </label>
            <input
              type="file"
              id="image"
              name="photo"
              onChange={handleInputImage}
              accept="image/*"
              required
              hidden
            />
          </div>
          <div className={styles.inputBox}>
            <input
              type="text"
              id="username"
              name="name"
              // placeholder="Username"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="username">Username</label>
          </div>
          <div className={`${styles.inputGrp} ${styles.inputGrp1}`}>
            <div className={`${styles.inputBox}`}>
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" onChange={handleInputChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className={styles.inputBox}>
              <label htmlFor="dob">DOB</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className={styles.inputGrp}>
            <div className={styles.inputBox}>
              <input
                type="text"
                id="city"
                name="city"
                // placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="city">City</label>
            </div>
            <div className={styles.inputBox}>
              <input
                type="text"
                id="country"
                name="country"
                // placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="country">Country</label>
            </div>
          </div>
          <div className={styles.inputBox}>
            <input
              type="text"
              id="description"
              name="description"
              // placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="description">Interests</label>
          </div>
          <div className={styles.inputBox}>
            <input
              type="password"
              id="password"
              name="password"
              // placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          <input
            type="submit"
            value="Submit"
            className={styles.submit_btn}
            onClick={handleSignup}
          />
        </form>
      </div>
    </div>
  );
}
