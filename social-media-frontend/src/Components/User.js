import styles from "./User.module.css";
import pic from "../images/user.jpg";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import ListPage from "./ListPage";
import { backendUrl } from "../Utils/backendUrl";
import Swal from "sweetalert2";
import { AccountCircle } from "@mui/icons-material";

export default function User() {
  const [use, setUse] = useState({});
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [followflag, setFollowFlag] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [clickedtype, setClickeddType] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
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
          setUser(data.user);
          console.log("Search Successful");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));

    fetch(`${backendUrl}/api/user/user`, {
      method: "POST",
      body: JSON.stringify({ _id: id }),
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

    fetch(`${backendUrl}/api/post/userPosts`, {
      method: "POST",
      body: JSON.stringify({ _id: id }),
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
  }, [id]);

  useEffect(() => {
    if (user && use.followers && use) {
      const isFollowed = use.followers.includes(user.name);
      console.log("User ", user.name);
      console.log("is followed -----------------------------", isFollowed);
      console.log("user followers", use.followers);
      setFollowFlag(isFollowed);
      // setFollow(use.name);
    } // eslint-disable-next-line
  }, [use.followers]);

  const handleFollow = () => {
    Swal.fire({
      width: "120",
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    fetch(`${backendUrl}/api/user/follow`, {
      method: "POST",
      body: JSON.stringify({ userName: use.name }),
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
          console.log(data.user);
          setUse(data.user);
          // setFollowFlag((prevFollowFlag) => !prevFollowFlag);
          console.log("Search Successful");
        } else {
          return;
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

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
          <button onClick={handleFollow}>
            {followflag ? "Following" : "Follow"}
          </button>
          <button onClick={() => navigate("/chat", { state: use.name })}>
            Message
          </button>
        </div>
        {posts.length > 0 && (
          <>
            <div className={styles.p} ref={postsRef}>
              {/* Posts */}
            </div>
            <div className={styles.posts}>
              {posts &&
                posts.map((post) => (
                  <Post key={post._id} post={post} user={user} admin="false" />
                ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
