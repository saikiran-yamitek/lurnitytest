// socket.js
import { Server } from "socket.io";

let io;

export const initIo = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // frontend origin
      methods: ["GET", "POST", "PATCH"]
    }
  });

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIo = () => io;
