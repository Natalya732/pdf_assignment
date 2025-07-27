import { Dispatch, SetStateAction } from "react";

export interface PDFDocument {
  id: string;
  name: string;
  url: string;
  pages: number;
  uploadedAt: Date;
  fileHash: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  type: "user" | "ai";
  timestamp: Date;
  citations?: Citation[];
}

export interface Citation {
  page: number;
  text: string;
}

export interface ChatResponse {
  message: string;
  citations: Citation[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface NotebookProviderContext {
  currentDocument: PDFDocument | null;
  currentPdfPage: number;
  chatSession: ChatSession | null;
  setCurrentDocument: Dispatch<SetStateAction<PDFDocument>>;
  setCurrentPdfPage: Dispatch<SetStateAction<number>>;
  handlePdfUpload: (document: PDFDocument, pdfPages: string[]) => Promise<void>;
  isLoading: boolean;
  chatSessionError: any;
  refetchChatSession: () => void;
  currentUserId: string | null;
  setCurrentUserId: Dispatch<SetStateAction<string | null>>;
  handleAddChatMessage: (
    message: ChatMessage | ChatMessage[],
    set?: boolean
  ) => Promise<void>;
}

export interface PDFContent {
  pages: PDFPage[];
  totalPages: number;
}

// Chat Session Types
export interface PDFPage {
  text: string;
  pageNumber: number;
}

export interface ChatSession {
  fileHash: string;
  pdfContext: PDFPage[];
  chatMessages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatSessionRequest {
  fileHash: string;
  pdfContext: PDFPage[];
}

export interface GetChatSessionRequest {
  fileHash: string;
}

export interface UpdateChatSessionRequest {
  pdfContext?: PDFPage[];
  chatMessages?: ChatMessage[];
}

export interface DeleteChatSessionRequest {
  fileHash: string;
}

export interface ChatSessionResponse {
  success: boolean;
  fileHash: string;
  message?: string;
  session?: ChatSession;
  error?: string;
  details?: string;
}

export interface SendMessageRequest {
  message: string;
  systemPrompt?: string;
  userId?: string;
  fileHash: string;
}

export interface SendMessageResponse {
  success: boolean;
  response: string;
  fileHash: string;
  timestamp: string;
  error?: string;
  details?: string;
}
