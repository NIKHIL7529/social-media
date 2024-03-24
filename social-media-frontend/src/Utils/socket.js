import io from "socket.io-client";
import { backendUrl } from "./backendUrl";
import { useState } from "react";

export const Socket = () => {
  const [socket, setSocket] = useState();
  if (socket) {
    return socket;
  } else {
    let socket = io(`${backendUrl}`, {
      withCredentials: true,
    });
    setSocket(socket);
    return socket;
  }
};
