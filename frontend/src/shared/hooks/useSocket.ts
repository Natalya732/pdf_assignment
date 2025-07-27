import { useRef, useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import { SOCKET_EVENTS } from "../constants/socket";
import { env } from "../constants/env";

function useSocket(
  manualConnect = false,
  eventToFireOnBeforeDisconnect = { name: "", payload: {} }
) {
  const socket = useRef<Socket | null>(null);

  const [_, setCounter] = useState(0);

  const handleSocketEvents = () => {
    if (!socket.current) return;

    socket.current.on(SOCKET_EVENTS.CONNECT, () => {
      console.log("⚡ Socket connected");
    });

    socket.current.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log("⚡🔴 Socket disconnected");
    });

    socket.current.on(SOCKET_EVENTS.ERROR, (msg: string) => {
      console.log("⚡⚠️ Socket Error:", msg);
    });
  };

  function initSocket() {
    if (socket.current) return;

    socket.current = io(env.VITE_BACKEND_BASE);
    handleSocketEvents();
    setCounter((p) => p + 1);
  }

  function connectSocket() {
    if (!socket.current) initSocket();
  }

  useEffect(() => {
    if (!manualConnect) initSocket();

    return function () {
      if (socket.current?.disconnect && socket.current.connected) {
        if (eventToFireOnBeforeDisconnect.name) {
          socket.current.emit(
            eventToFireOnBeforeDisconnect.name,
            eventToFireOnBeforeDisconnect.payload
          );
        }

        setTimeout(() => {
          socket.current!.disconnect();
          socket.current = null;
        }, 1000);
        // wait before disconnecting otherwise socket will be disconnected before this event gets fired
      }
    };
  }, []);

  return {
    socket: socket.current,
    connectToSocket: manualConnect
      ? connectSocket
      : () => console.log("Manual connect not passed as true"),
  };
}

export default useSocket;
