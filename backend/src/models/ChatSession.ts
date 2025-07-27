import mongoose, { Schema, Document } from "mongoose";
import { Citation } from "../utils/aiService.js";
interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  userId?: string;
  type: "user" | "ai";
  citations?: Citation[];
}

interface PDFPage {
  text: string;
  pageNumber: number;
  summary: string;
}

export interface IChatSession extends Document {
  fileHash: string;
  pdfContext: PDFPage[];
  chatMessages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const PDFPageSchema = new Schema<PDFPage>({
  text: { type: String, required: true },
  pageNumber: { type: Number, required: true },
  summary: { type: String, required: false },
});

const CitationSchema = new Schema<Citation>({
  page: { type: Number, required: true },
  text: { type: String, required: true },
});

const ChatMessageSchema = new Schema<ChatMessage>({
  id: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, required: true },
  userId: { type: String },
  type: { type: String, enum: ["user", "ai"], required: true },
  citations: { type: [CitationSchema], required: false },
});

const ChatSessionSchema = new Schema<IChatSession>(
  {
    fileHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pdfContext: [PDFPageSchema],
    chatMessages: [ChatMessageSchema],
  },
  {
    timestamps: true,
  }
);

// Create compound index for better query performance
ChatSessionSchema.index({ fileHash: 1, "chatMessages.timestamp": -1 });

export const ChatSession = mongoose.model<IChatSession>(
  "ChatSession",
  ChatSessionSchema
);
