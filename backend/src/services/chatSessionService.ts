import aiService from "@/utils/aiService.js";
import { ChatSession, IChatSession } from "../models/ChatSession.js";
import { SocketHandler } from "../utils/socketHandler.js";

interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  userId?: string;
  type: "user" | "ai";
}

interface PDFPage {
  text: string;
  pageNumber: number;
  summary: string;
}

export class ChatSessionService {
  // Create or get chat session
  static async getOrCreateSession(fileHash: string): Promise<IChatSession> {
    let session = await ChatSession.findOne({ fileHash });

    if (!session) {
      session = new ChatSession({
        fileHash,
        pdfContext: [],
        chatMessages: [],
      });
      await session.save();
    }

    return session;
  }

  // Get chat session by file hash
  static async getSessionByFileHash(
    fileHash: string
  ): Promise<IChatSession | null> {
    return await ChatSession.findOne({ fileHash });
  }

  // Add message to chat session
  static async addMessage(
    fileHash: string,
    message: ChatMessage
  ): Promise<void> {
    const session = await this.getOrCreateSession(fileHash);
    session.chatMessages.push(message);
    await session.save();
  }

  // Update PDF context
  static async updatePDFContext(
    fileHash: string,
    pdfContext: PDFPage[]
  ): Promise<void> {
    const session = await this.getOrCreateSession(fileHash);

    const isSummaryPresent = pdfContext.some(
      (page) => page.summary?.length > 0
    );

    if (!isSummaryPresent) {
      // fill in summary for each page
      for (const page of pdfContext) {
        const summary = await aiService.sendMessage(
          `Summarize this page text: ${page.text}`,
          `You are a helpful assistant that summarizes pages of a document.
          IMPORTANT: The summary should be in under 500 characters.
          `
        );

        page.summary = summary;
      }
    }

    session.pdfContext = pdfContext;
    await session.save();
  }

  // Get chat history
  static async getChatHistory(
    fileHash: string
  ): Promise<{ messages: ChatMessage[]; pdfContext: PDFPage[] }> {
    const session = await ChatSession.findOne({ fileHash });

    if (!session) {
      return { messages: [], pdfContext: [] };
    }

    return {
      messages: session.chatMessages,
      pdfContext: session.pdfContext,
    };
  }

  // Delete chat session
  static async deleteSession(fileHash: string): Promise<void> {
    await ChatSession.deleteOne({ fileHash });
  }

  // Get all sessions for a user (if you want to implement user-specific sessions later)
  static async getSessionsByUser(userId: string): Promise<IChatSession[]> {
    // This would need to be modified if you add user association to sessions
    return await ChatSession.find({});
  }

  // Broadcast message to file room
  static broadcastToFile(fileHash: string, event: string, data: any): void {
    SocketHandler.emitToRoom(fileHash, event, data);
  }

  // Send message to specific user in file room
  static sendToUserInFile(
    fileHash: string,
    userId: string,
    event: string,
    data: any
  ): void {
    SocketHandler.emitToSocket(userId, event, data);
  }
}
