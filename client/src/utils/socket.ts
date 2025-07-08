// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:6050"; //
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(URL, {
      withCredentials: true, // 
    });
  }
  console.log(socket,"from s.ts")
  return socket;
};
