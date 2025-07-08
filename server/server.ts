import app from "./src/app";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
import { adminCheckSeeder } from "./src/seed/seeder";

import { createServer } from "http";
import { Server } from "socket.io";
import { socketAuthMiddleware } from "./src/middleware/verifyAccessToken"; // ✅ New import

dotenv.config({ path: "./.env" });

// ✅ Create HTTP server from express app
const httpServer = createServer(app);

// ✅ Attach Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // frontend origin
    credentials: true,               // allow cookies
  },
});

// ✅ Authenticate each socket connection using cookie + JWT
io.use(socketAuthMiddleware);

// ✅ Map of connected users
const connectedUsers = new Map<string, string>();
console.log(connectedUsers,"bk-socket")

const emitOnlineUsers = () => {
  const onlineUserIds = Array.from(connectedUsers.keys());
  io.emit("online-users", onlineUserIds); // Broadcast to all connected clients
};

io.on("connection", (socket) => {
  const user = (socket as any).user;

  if (user && user.id) {
    connectedUsers.set(user.id, socket.id);
    console.log(`✅ User connected: ${user.id} -> ${socket.id}`);
     socket.on("get-online-users", () => {
     console.log("get online users request from frontend")
    emitOnlineUsers();})

    // emitOnlineUsers(); // Send updated list to everyone
  }

  socket.on("disconnect", () => {
    if (user?.id) {
      connectedUsers.delete(user.id);
      console.log(`❌ User disconnected: ${user.id}`);

      emitOnlineUsers(); // Update clients again
    }
  });
});


// ✅ Export io and connectedUsers for use in controllers
export { io, connectedUsers };

connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 6000;

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // ✅ Run seeder if needed
    adminCheckSeeder();
  })
  .catch((error) => {
    console.error(`❌ Error connecting to MongoDB: ${error}`);
    process.exit(1);
  });
