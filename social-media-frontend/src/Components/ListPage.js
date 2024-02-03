// import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import styles from "./ListPage.module.css";
// import { useLocation } from "react-router-dom/cjs/react-router-dom.min";

export default function ListPage({ list, clicked, setClicked }) {
  //   const navigate = useNavigate();
  useEffect(() => {
    console.log(list);
  });

  const check = () => {
    if ((clicked = true)) {
      setClicked(false);
    }
  };

  return (
    <div className={styles.ListPage}>
      <p onClick={check}>close</p>
      {list && Array.isArray(list) ? (
        list.map((user, index) => <li key={index}>{user}</li>)
      ) : (
        <p>No followers available</p>
      )}
    </div>
  );
}
