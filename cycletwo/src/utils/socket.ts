import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_URL || ""],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Join personal room
    socket.on("join", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export const emitToUser = (userId: number, event: string, data: any) => {
  getIO().to(`user_${userId}`).emit(event, data);
};

export const emitToShopkeeper = (shopkeeperId: number, event: string, data: any) => {
  getIO().to(`shop_${shopkeeperId}`).emit(event, data);
};

export const emitToAdmins = (event: string, data: any) => {
  getIO().to("admins").emit(event, data);
};
