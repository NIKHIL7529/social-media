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
      <div className={styles.close} onClick={check}>
        X
      </div>
      <div className={styles.list}>
        {list && Array.isArray(list) ? (
          list.map((user, index) => <div key={index}>{user}</div>)
        ) : (
          <div>Not available</div>
        )}
      </div>
    </div>
  );
}
