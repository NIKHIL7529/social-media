import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddPost.module.css";
import { backendUrl } from "../Utils/backendUrl";
import image from "../images/post.jpg";
import Swal from "sweetalert2";

export default function AddPost({ onClose }) {
  const navigate = useNavigate();

  const [postData, setPostData] = useState({
    topic: "",
    text: "",
    photo: "",
    commentable: false,
  });

  // const [inputs, setInputs] = useState([
  //   { id: 1, label: "Image 1", file: null },
  // ]);

  // const validateInputs = () => {
  //   for (const input of inputs) {
  //     if (!input.file) {
  //       return false;
  //     }
  //   }
  //   return true;
  // };

  // const addInput = () => {
  //   if (validateInputs()) {
  //     const newId = inputs.length + 1;
  //     setInputs([
  //       ...inputs,
  //       { id: newId, label: `Image ${newId}`, file: null },
  //     ]);
  //   }
  // };

  // const removeInput = (id) => {
  //   setInputs(inputs.filter((input) => input.id !== id));
  // };

  // const handleFileChange = (id, file) => {
  //   const updatedInputs = inputs.map((input) =>
  //     input.id === id ? { ...input, file } : input
  //   );
  //   setInputs(updatedInputs);
  // };

  const handleInputImage = (e) => {
    const file = e.target.files[0];
    console.log(e.target.files[0].size);
    if (e.target.files[0].size > 10485760) {
      console.log("Too large -------- - -");
      Swal.fire({
        icon: "warning",
        title: "Image size too large (max size 10mb)",
        showConfirmButton: false,
      });
      e.target.value = null;
    } else if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPostData((prevData) => ({
          ...prevData,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setPostData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleComment = (e) => {
    setPostData((prevPostData) => ({
      ...prevPostData,
      commentable: e.target.checked ? true : false,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(postData);

    if (postData.photo !== "") {
      console.log("addPost");
      Swal.fire({
        width: "120",
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2000,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      fetch(`${backendUrl}/api/post/addPost`, {
        method: "POST",
        body: JSON.stringify(postData),
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
            console.log("Post added Successfully");
            navigate("/profile");
          }
          if (data.status === 500) {
            Swal.fire({
              icon: "warning",
              title: "Internal server error",
              showConfirmButton: false,
            });
          }
        })
        .catch((err) => console.log("Error during fetch: ", err));
    } else {
      Swal.fire({
        icon: "warning",
        title: "All fields are required",
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className={styles.AddPost}>
      <div className={styles.header}>Create Post</div>
      <div className={styles.box}>
        <div className={styles.inputBox}>
          <label htmlFor="image">
            <img src={postData.photo ? postData.photo : image} alt="" />
            <div className={styles.imageOverlay}>
              <div>
                <i className="fa fa-camera fa-2x"></i>
              </div>
              <div>Select Photo from the device</div>
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
            name="topic"
            placeholder="Enter topic"
            value={postData.topic}
            onChange={handleInput}
          />
          <textarea
            type="text"
            name="text"
            placeholder="Enter caption here"
            value={postData.text}
            onChange={handleInput}
          />

          <label htmlFor="comment">
            <input
              type="checkbox"
              id="comment"
              name="comment"
              value="Comment"
              onChange={handleComment}
              required
            />{" "}
            Can others comment on this post?
          </label>
        </div>
      </div>
      {/* {inputs.map((input) => (
        <div key={input.id}>
          <label htmlFor={`image${input.id}`}>{input.label}:</label>
          <input
            type="file"
            id={`image${input.id}`}
            accept="image/*, video/*"
            onChange={(e) => handleFileChange(input.id, e.target.files[0])}
          />
          <button onClick={() => removeInput(input.id)}>Remove</button>
        </div>
      ))}

      <button onClick={addInput}>Add Image</button> */}
      <div className={styles.footer}>
        <input
          type="submit"
          value="Post"
          className={styles.submit_btn}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
