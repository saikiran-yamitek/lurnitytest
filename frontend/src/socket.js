import { io } from "socket.io-client";
const socket = io("http://localhost:7700"); // Update if hosted on different domain
export default socket;
