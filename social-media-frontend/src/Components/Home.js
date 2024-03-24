import { useContext, useEffect } from "react";
import styles from "./Home.module.css";
import UserContext from "../UserContext";

export default function Home() {
  const user = useContext(UserContext);
  useEffect(() => {
    console.log(user);
  }, []);
  
  return <div className={styles.Home}>{user.name}</div>;
}
