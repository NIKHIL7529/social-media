import { useEffect, useState } from "react";
import Post from "./Post";
import styles from "./Posts.module.css";
import { backendUrl } from "../Utils/backendUrl";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [use, setUse] = useState({});
  const [skip, setSkip] = useState(0);
  const [follow, setFollow] = useState("");

  useEffect(() => {
    if (follow.length > 0 && use) {
      let userFollowings = [...use.followings];
      let check = use.followings.findIndex((following) => following === follow);

      if (check !== -1) {
        userFollowings.splice(check, 1);
      } else {
        userFollowings.push(follow);
      }

      console.log("follow -------------------------------------------", follow);
      console.log(userFollowings);

      setUse((prevUse) => ({
        ...prevUse,
        followings: userFollowings,
      }));
      setFollow("");
    }// eslint-disable-next-line 
  }, [follow]);

  useEffect(() => {
    fetch(`${backendUrl}/api/user/profile`, {
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
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/post`, {
      method: "POST",
      body: JSON.stringify({ skip }),
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
          let updatedPost = [];
          data.post.map((temp) => {
            if (temp.user != null) {
              updatedPost.push(temp);
            }
          });
          setPosts((prevPosts) => [...prevPosts, ...updatedPost]);
          console.log("Search Successful");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  }, [skip]);

  const handleScroll = () => {
    if (skip > posts.length) {
      console.log("Enter4");
      return;
    }
    console.log("Enter1");
    const postsElement = document.querySelector("#posts");
    console.log("PostElement:", postsElement);
    if (postsElement) {
      console.log("Enter2");
      const scrollHeight = postsElement.scrollHeight;
      const scrollTop = postsElement.scrollTop;
      const clientHeight = postsElement.clientHeight;
      console.log(scrollHeight, clientHeight, scrollTop);
      if (scrollHeight - 100 - scrollTop <= clientHeight) {
        console.log("Enter3");
        setSkip((prevSkip) => prevSkip + 5);
      }
    }
  };

  return (
    <div className={styles.Posts}>
      {/* <div className={styles.postheader}>Posts</div> */}
      <div className={styles.posts} id="posts" onScroll={handleScroll}>
        {posts &&
          posts.map((post) => (
            <Post key={post._id} post={post} user={use} setFollow={setFollow} />
          ))}
      </div>
    </div>
  );
}
