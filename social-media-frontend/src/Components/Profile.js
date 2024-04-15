import styles from "./Profile.module.css";
import user from "../images/user.jpg";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import ListPage from "./ListPage";
import { backendUrl } from "../Utils/backendUrl";
import Swal from "sweetalert2";
import { AccountCircle } from "@mui/icons-material";

export default function Profile() {
  const [use, setUse] = useState({});
  const [posts, setPosts] = useState([]);
  const [clicked, setClicked] = useState(false);
  const [clickedtype, setClickeddType] = useState(null);
  const [index, setIndex] = useState("");
  const navigate = useNavigate();

  const postsRef = useRef(null);

  const handleClick = (type) => {
    console.log(type);
    const clicktype = type;
    if (clickedtype === clicktype) {
      setClicked((prevClick) => !prevClick);
    } else {
      setClickeddType(type);
      setClicked(true);
    }
  };

  const handlePostsClick = () => {
    if (postsRef.current) {
      postsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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

    fetch(`${backendUrl}/api/post/signedUserPosts`, {
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
          console.log(data.post);
          setPosts(data.post);
          console.log("Search Successful");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  }, []);

  useEffect(() => {
    console.log("Update array after deletion", index);
    if (index.length > 0) {
      console.log("Enter-------------------");
      let post = [...posts];
      post = post.filter((post) => post._id !== index);
      setPosts(post);
      setIndex("");
    } // eslint-disable-next-line
  }, [index]);

  console.log(index);
  console.log(posts);

  const handleImage = () => {
    Swal.fire({
      imageUrl: `${use.photo}`,
      imageSize: "600x600",
      padding: "0",
      showConfirmButton: false,
    });
  };

  return (
    <>
      {clicked && (
        <ListPage
          list={clickedtype}
          clicked={clicked}
          setClicked={setClicked}
        />
      )}
      <div className={styles.Profile}>
        <div className={styles.profile}>
          {use.photo ? (
            <img src={use.photo} alt={use.name} onClick={handleImage} />
          ) : (
            <AccountCircle />
          )}
          <div className={styles.name}>{use.name}</div>
          <div className={styles.desc}>{use.description}</div>
          <div className={styles.list}>
            <div onClick={() => handleClick(use.followers)}>
              {use.followers && use.followers.length} Followers
            </div>
            <div onClick={() => handleClick(use.followings)}>
              {use.followings && use.followings.length} Following
            </div>
            <div onClick={handlePostsClick}>{posts && posts.length} Posts</div>
          </div>
          <button onClick={() => navigate("/addPost")}>Create Post</button>
          <button onClick={() => navigate("/editProfile")}>Edit Profile</button>
        </div>
        <div className={styles.p} ref={postsRef}>
          {/* Posts */}
        </div>
        <div className={styles.posts}>
          {posts &&
            posts.map((post) => (
              <Post key={post._id} post={post} user={use} setIndex={setIndex} />
            ))}
        </div>
      </div>
    </>
  );
}
