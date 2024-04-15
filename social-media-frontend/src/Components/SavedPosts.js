import { useEffect, useState } from "react";
import styles from "./Posts.module.css";
import { backendUrl } from "../Utils/backendUrl";
import Post from "./Post";
import Swal from "sweetalert2";

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [use, setUse] = useState({});
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
    } // eslint-disable-next-line
  }, [follow]);

  useEffect(() => {
    Swal.fire({
      width: "120",
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
    });

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

    fetch(`${backendUrl}/api/post/savedPosts`, {
      method: "GET",
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
          Swal.close();
          console.log(data.post);
          let updatedPost = [];
          data.post.map((temp) => {
            if (temp.user != null) {
              updatedPost.push(temp);
            }
          });
          setPosts([...updatedPost]);
          console.log("Search Successful");
        }
      });
  }, []);

  return (
    <div className={styles.Posts} id="posts">
      {/* <div className={styles.postheader}>Posts</div> */}
      <div className={styles.posts}>
        {posts &&
          posts.map((post) => (
            <Post key={post._id} post={post} user={use} setFollow={setFollow} />
          ))}
      </div>
    </div>
  );
}
