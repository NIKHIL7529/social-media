import { useEffect, useState } from "react";
import Post from "./Post";
import styles from "./Posts.module.css";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [use, setUse] = useState({});

  useEffect(() => {
    fetch("https://social-media-backend-d246.onrender.com/api/user/profile", {
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
          console.log(data.user);
          setUse(data.user);
          console.log("Search Successful");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));

    fetch("https://social-media-backend-d246.onrender.com/api/post", {
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
          console.log(data.post);
          setPosts(data.post);
          console.log("Search Successful");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  }, []);

  return (
    <div className={styles.Posts}>
      <h1>Posts</h1>
      {posts &&
        posts.map((post) => <Post key={post._id} post={post} user={use} />)}
    </div>
  );
}
