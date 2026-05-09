import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@store/authStore";

const SOCKET_URL = "http://13.201.45.153:5000/socket-chat";

let socket: Socket | null = null;

export const connectSocket = (): Socket | null => {
  if (socket?.connected) return socket;
  
  const token = useAuthStore.getState().token;
  if (!token) {
    console.warn("[Socket] Tried to connect without token");
    return null;
  }

  console.log("[Socket] Initializing connection...");
  socket = io(SOCKET_URL, {
    auth: { token },
    // Removed strict transports: ["websocket"] so it can fallback to polling
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect_error", (error: any) => {
    console.warn("[Socket] Connect error:", error.message);
    if (error.description) {
      console.warn("[Socket] Error Description:", error.description);
      console.warn("[Socket] Error Context:", error.context);
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("[Socket] Disconnecting manually");
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket => {
  if (!socket) {
    return connectSocket() as Socket;
  }
  return socket;
};
