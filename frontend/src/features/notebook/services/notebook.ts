import { env } from "@/shared/constants/env";
import axios from "axios";
import {
  CreateChatSessionRequest,
  UpdateChatSessionRequest,
  ChatSessionResponse,
  SendMessageRequest,
  SendMessageResponse,
  PDFPage,
} from "../types";

export const healthCheck = async (): Promise<boolean> => {
  try {
    await axios.get(`${env.VITE_BACKEND_BASE}/health`);
    return true;
  } catch (error: any) {
    console.error("Error health checking:", error);
    return false;
  }
};

export const createOrUpdateChatSession = async (
  data: CreateChatSessionRequest
): Promise<ChatSessionResponse> => {
  try {
    const response = await axios.post(
      `${env.VITE_BACKEND_BASE}/api/chat/session/create`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating/updating chat session:", error);
    return {
      success: false,
      error:
        error.response?.data?.error || "Failed to create/update chat session",
      details: error.response?.data?.details,
      fileHash: data.fileHash,
    };
  }
};

export const getChatSession = async (
  fileHash: string
): Promise<ChatSessionResponse> => {
  try {
    const response = await axios.post(
      `${env.VITE_BACKEND_BASE}/api/chat/session/get`,
      { fileHash }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error getting chat session:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to get chat session",
      details: error.response?.data?.details,
      fileHash,
    };
  }
};

export const partialUpdateChatSession = async (
  fileHash: string,
  data: UpdateChatSessionRequest
): Promise<ChatSessionResponse> => {
  try {
    const response = await axios.post(
      `${env.VITE_BACKEND_BASE}/api/chat/session/update`,
      { fileHash, ...data }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating chat session:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update chat session",
      details: error.response?.data?.details,
      fileHash,
    };
  }
};

export const deleteChatSession = async (
  fileHash: string
): Promise<ChatSessionResponse> => {
  try {
    const response = await axios.post(
      `${env.VITE_BACKEND_BASE}/api/chat/session/delete`,
      { fileHash }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error deleting chat session:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to delete chat session",
      details: error.response?.data?.details,
      fileHash,
    };
  }
};

export const sendMessage = async (
  data: SendMessageRequest
): Promise<SendMessageResponse> => {
  try {
    const response = await axios.post(
      `${env.VITE_BACKEND_BASE}/api/chat/send`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Error sending message:", error);
    return {
      success: false,
      response: "",
      fileHash: data.fileHash,
      timestamp: new Date().toISOString(),
      error: error.response?.data?.error || "Failed to send message",
      details: error.response?.data?.details,
    };
  }
};

// Helper function to update PDF context
export const updatePDFContext = async (
  fileHash: string,
  pdfContext: PDFPage[]
): Promise<ChatSessionResponse> => {
  return partialUpdateChatSession(fileHash, { pdfContext });
};