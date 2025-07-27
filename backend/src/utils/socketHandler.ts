import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { SocketEventHandlers } from "./socketEventHandlers.js";
import {
  JoinFileEvent,
  LeaveFileEvent,
  SendMessageEvent,
  UpdatePDFContextEvent,
  TypingEvent,
} from "../types/socket.js";
import { SOCKET_EVENTS } from "@/constants/socket.js";

export class SocketHandler {
  private static instance: SocketHandler;
  private io: SocketIOServer;

  private constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.setupEventHandlers();
  }

  // Singleton pattern - get instance
  public static getInstance(server?: HTTPServer): SocketHandler {
    if (!SocketHandler.instance) {
      if (!server) {
        throw new Error("Server instance is required for first initialization");
      }
      SocketHandler.instance = new SocketHandler(server);
    }
    return SocketHandler.instance;
  }

  // Static method to get io instance
  public static getIO(): SocketIOServer {
    if (!SocketHandler.instance) {
      throw new Error(
        "SocketHandler not initialized. Call getInstance() first."
      );
    }
    return SocketHandler.instance.io;
  }

  // Static method to emit to all connected clients
  public static emitToAll(event: string, data: any): void {
    const io = SocketHandler.getIO();
    io.emit(event, data);
  }

  // Static method to emit to specific room
  public static emitToRoom(room: string, event: string, data: any): void {
    const io = SocketHandler.getIO();
    io.to(room).emit(event, data);
  }

  // Static method to emit to specific socket
  public static emitToSocket(socketId: string, event: string, data: any): void {
    const io = SocketHandler.getIO();
    io.to(socketId).emit(event, data);
  }

  // Static method to broadcast to all except sender
  public static broadcast(event: string, data: any, senderId?: string): void {
    const io = SocketHandler.getIO();
    if (senderId) {
      io.except(senderId).emit(event, data);
    } else {
      io.emit(event, data);
    }
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle joining a file room
      socket.on(SOCKET_EVENTS.JOIN_FILE, (data: JoinFileEvent) => {
        SocketEventHandlers.handleJoinFile(socket, data);
      });

      // Handle leaving a file room
      socket.on(SOCKET_EVENTS.LEAVE_FILE, (data: LeaveFileEvent) => {
        SocketEventHandlers.handleLeaveFile(socket, data);
      });

      // Handle chat messages
      socket.on(SOCKET_EVENTS.SEND_MESSAGE, (data: SendMessageEvent) => {
        SocketEventHandlers.handleSendMessage(socket, data);
      });

      // Handle disconnection
      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        SocketEventHandlers.handleDisconnect(socket);
      });

      // Handle typing indicators
      socket.on(SOCKET_EVENTS.TYPING_START, (data?: TypingEvent) => {
        SocketEventHandlers.handleTypingStart(socket, data);
      });

      socket.on(SOCKET_EVENTS.TYPING_STOP, (data?: TypingEvent) => {
        SocketEventHandlers.handleTypingStop(socket, data);
      });
    });
  }

  // Instance method to get the io instance (for backward compatibility)
  getIO(): SocketIOServer {
    return this.io;
  }
}
