import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddPost.module.css";

export default function AddPost({ onClose }) {
  const navigate = useNavigate();

  const [postData, setPostData] = useState({
    topic: "",
    text: "",
    photo: "",
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
    if (file) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("addPost");

    fetch("https://social-media-backend-d246.onrender.com/api/post/addPost", {
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
        console.log("Fetch response received: ", data);
        if (data.status === 200) {
          console.log("Post added Successfully");
          navigate("/profile");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  return (
    <div className={styles.AddPost}>
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
        placeholder="Enter text"
        value={postData.text}
        onChange={handleInput}
      />
      <img src={postData.photo} alt="" />
      <input
        type="file"
        name="photo"
        placeholder="Photo"
        accept="image/*"
        onChange={handleInputImage}
      />
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
      <button onClick={handleSubmit}>Post</button>
    </div>
  );
}
