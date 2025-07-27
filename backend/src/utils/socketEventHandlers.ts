import { Socket } from "socket.io";
import aiService, { Citation } from "./aiService.js";
import { ChatSession } from "../models/ChatSession.js";
import { SocketHandler } from "./socketHandler.js";
import {
  JoinFileEvent,
  LeaveFileEvent,
  SendMessageEvent,
  TypingEvent,
  ChatMessageResponse,
  ChatHistoryResponse,
  ErrorResponse,
  UserActivityEvent,
} from "../types/socket.js";
import { SOCKET_EVENTS } from "@/constants/socket.js";

interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  userId?: string;
  type: "user" | "ai";
  citations?: Citation[];
}

export class SocketEventHandlers {
  static async handleSendMessage(
    socket: Socket,
    data: SendMessageEvent
  ): Promise<void> {
    try {
      const { message, userId, fileHash } = data;

      if (!fileHash) {
        const errorResponse: ErrorResponse = {
          message: "File hash is required",
          error: "FILE_HASH_REQUIRED",
        };
        socket.emit(SOCKET_EVENTS.ERROR, errorResponse);
        return;
      }

      // Join the room based on fileHash
      socket.join(fileHash);

      // Find or create chat session
      let chatSession = await ChatSession.findOne({ fileHash });
      if (!chatSession) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Chat session not found",
          error: "CHAT_SESSION_NOT_FOUND",
        });
        return;
      }

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        message,
        timestamp: new Date(),
        userId,
        type: "user",
      };

      chatSession.chatMessages.push(userMessage);

      const messageReceivedResponse: ChatMessageResponse = {
        ...userMessage,
        fileHash,
      };
      socket.emit(SOCKET_EVENTS.MESSAGE_RECEIVED, messageReceivedResponse);

      // Send message to AI with context
      const aiResponse = await this.getAIResponseWithContext(chatSession);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: aiResponse.message,
        citations: aiResponse.citations,
        timestamp: new Date(),
        userId: "ai",
        type: "ai",
      };

      chatSession.chatMessages.push(aiMessage);

      await chatSession.save();

      // Broadcast AI response to all users in the room (fileHash)
      const aiResponseData: ChatMessageResponse = {
        ...aiMessage,
        fileHash,
      };
      SocketHandler.emitToRoom(fileHash, "ai_response", aiResponseData);
    } catch (error) {
      console.error("Error processing message:", error);
      const errorResponse: ErrorResponse = {
        message: "Failed to process your message",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      socket.emit(SOCKET_EVENTS.ERROR, errorResponse);
    }
  }

  static async handleJoinFile(
    socket: Socket,
    data: JoinFileEvent
  ): Promise<void> {
    try {
      const { fileHash } = data;

      if (!fileHash) {
        const errorResponse: ErrorResponse = {
          message: "File hash is required",
          error: "FILE_HASH_REQUIRED",
        };
        socket.emit(SOCKET_EVENTS.ERROR, errorResponse);
        return;
      }

      // Join the room based on fileHash
      socket.join(fileHash);

      console.log(`User ${socket.id} joined file room: ${fileHash}`);

      // Find existing chat session and send chat history
      const chatSession = await ChatSession.findOne({ fileHash });

      const chatHistoryResponse: ChatHistoryResponse = {
        fileHash,
        messages: chatSession?.chatMessages || [],
        pdfContext: chatSession?.pdfContext || [],
      };

      socket.emit(SOCKET_EVENTS.CHAT_HISTORY, chatHistoryResponse);

      // Notify other users in the room
      const userJoinedEvent: UserActivityEvent = {
        fileHash,
        userId: socket.id,
      };
      socket.to(fileHash).emit(SOCKET_EVENTS.USER_JOINED_FILE, userJoinedEvent);
    } catch (error) {
      console.error("Error joining file:", error);
      const errorResponse: ErrorResponse = {
        message: "Failed to join file",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      socket.emit(SOCKET_EVENTS.ERROR, errorResponse);
    }
  }

  static async handleLeaveFile(
    socket: Socket,
    data: LeaveFileEvent
  ): Promise<void> {
    try {
      const { fileHash } = data;

      if (!fileHash) {
        return;
      }

      // Leave the room
      socket.leave(fileHash);

      console.log(`User ${socket.id} left file room: ${fileHash}`);

      // Notify other users in the room
      const userLeftEvent: UserActivityEvent = {
        fileHash,
        userId: socket.id,
      };
      socket.to(fileHash).emit(SOCKET_EVENTS.USER_LEFT_FILE, userLeftEvent);
    } catch (error) {
      console.error("Error leaving file:", error);
    }
  }

  private static async getAIResponseWithContext(
    chatSession: any
  ): Promise<{ message: string; citations: any[] }> {
    try {
      // Build conversation history
      const conversationHistory = chatSession.chatMessages
        .slice(-10) // Last 10 messages for context
        .map((msg: any) => ({
          type: msg.type === "user" ? "user" : "ai",
          message: msg.message,
        }));

      // Get the last user message
      const lastUserMessage = chatSession.chatMessages
        .filter((msg: any) => msg.type === "user")
        .pop();

      if (!lastUserMessage) {
        return {
          message: "I apologize, but I couldn't find your question.",
          citations: [],
        };
      }

      // Send message with context and history using the new citation method
      const response = await aiService.sendMessageWithCitations(
        conversationHistory,
        chatSession.pdfContext
      );

      return response;
    } catch (error) {
      console.error("Error getting AI response with context:", error);
      return {
        message:
          "I apologize, but I encountered an error processing your request.",
        citations: [],
      };
    }
  }

  static handleDisconnect(socket: Socket): void {
    console.log(`User disconnected: ${socket.id}`);
  }

  static handleTypingStart(socket: Socket, data?: TypingEvent): void {
    socket.broadcast.emit(SOCKET_EVENTS.USER_TYPING, {
      userId: socket.id,
      fileHash: data?.fileHash,
    });
  }

  static handleTypingStop(socket: Socket, data?: TypingEvent): void {
    socket.broadcast.emit(SOCKET_EVENTS.USER_STOPPED_TYPING, {
      userId: socket.id,
      fileHash: data?.fileHash,
    });
  }
}
