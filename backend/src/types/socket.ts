import { Socket } from "socket.io";

// Base interface for all socket events
export interface BaseSocketEvent {
  userId?: string;
}

// Join file event
export interface JoinFileEvent extends BaseSocketEvent {
  fileHash: string;
}

// Leave file event
export interface LeaveFileEvent extends BaseSocketEvent {
  fileHash: string;
}

// Send message event
export interface SendMessageEvent extends BaseSocketEvent {
  message: string;
  fileHash: string;
}

// Update PDF context event
export interface UpdatePDFContextEvent extends BaseSocketEvent {
  fileHash: string;
  pdfContext: Array<{
    text: string;
    pageNumber: number;
  }>;
}

// Typing events
export interface TypingEvent extends BaseSocketEvent {
  fileHash?: string;
}

// Response interfaces
export interface ChatMessageResponse {
  id: string;
  message: string;
  timestamp: Date;
  userId?: string;
  type: "user" | "ai";
  fileHash?: string;
}

export interface ChatHistoryResponse {
  fileHash: string;
  messages: ChatMessageResponse[];
  pdfContext: Array<{
    text: string;
    pageNumber: number;
  }>;
}

export interface ErrorResponse {
  message: string;
  error: string;
}

export interface UserActivityEvent {
  fileHash: string;
  userId: string;
}

// Socket event handler types
export type SocketEventHandler<T extends BaseSocketEvent> = (
  socket: Socket,
  data: T
) => Promise<void> | void;
