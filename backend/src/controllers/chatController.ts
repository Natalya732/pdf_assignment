import { Request, Response } from "express";
import aiService from "../utils/aiService.js";
import { ChatSessionService } from "../services/chatSessionService.js";

// Helper function to validate PDF context
const validatePdfContext = (pdfContext: any[]): boolean => {
  return pdfContext.every(
    (page) =>
      typeof page === "object" &&
      typeof page.text === "string" &&
      typeof page.pageNumber === "number"
  );
};

// Helper function to format session response
const formatSessionResponse = (session: any) => ({
  fileHash: session?.fileHash,
  pdfContext: session?.pdfContext,
  chatMessages: session?.chatMessages || [],
  createdAt: session?.createdAt,
  updatedAt: session?.updatedAt,
});

// Create or update chat session with fileHash and pdfContext
export const createOrUpdateChatSession = async (
  req: Request,
  res: Response
) => {
  try {
    const { fileHash, pdfContext } = req.body;

    if (!fileHash) {
      return res.status(400).json({ error: "File hash is required" });
    }
    const existingSession = await ChatSessionService.getSessionByFileHash(
      fileHash
    );

    if (existingSession) {
      // Session exists, return it without updating
      res.json({
        success: true,
        fileHash,
        message: "Chat session already exists",
        session: formatSessionResponse(existingSession),
      });
      return;
    }

    if (!pdfContext || !Array.isArray(pdfContext)) {
      return res.status(400).json({ error: "PDF context array is required" });
    }

    if (!validatePdfContext(pdfContext)) {
      return res.status(400).json({
        error:
          "PDF context must be an array of objects with 'text' and 'pageNumber' properties",
      });
    }

    // Create or update the chat session
    await ChatSessionService.updatePDFContext(fileHash, pdfContext);

    // Get the updated session
    const session = await ChatSessionService.getSessionByFileHash(fileHash);

    res.json({
      success: true,
      fileHash,
      message: "Chat session created/updated successfully",
      session: formatSessionResponse(session),
    });
  } catch (error) {
    console.error("Error in createOrUpdateChatSession controller:", error);
    res.status(500).json({
      error: "Failed to create/update chat session",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get chat session by fileHash
export const getChatSession = async (req: Request, res: Response) => {
  try {
    const { fileHash } = req.body;

    if (!fileHash) {
      return res.status(400).json({ error: "File hash is required" });
    }

    const session = await ChatSessionService.getSessionByFileHash(fileHash);

    if (!session) {
      return res.status(404).json({
        error: "Chat session not found",
        fileHash,
      });
    }

    res.json({
      success: true,
      fileHash,
      session: formatSessionResponse(session),
    });
  } catch (error) {
    console.error("Error in getChatSession controller:", error);
    res.status(500).json({
      error: "Failed to get chat session",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Partial update of chat session (only specific fields)
export const partialUpdateChatSession = async (req: Request, res: Response) => {
  try {
    const { fileHash, pdfContext, chatMessages } = req.body;

    if (!fileHash) {
      return res.status(400).json({ error: "File hash is required" });
    }

    // Check if session exists
    const existingSession = await ChatSessionService.getSessionByFileHash(
      fileHash
    );
    if (!existingSession) {
      return res.status(404).json({
        error: "Chat session not found",
        fileHash,
      });
    }

    // Update only provided fields
    if (pdfContext && Array.isArray(pdfContext)) {
      if (!validatePdfContext(pdfContext)) {
        return res.status(400).json({
          error:
            "PDF context must be an array of objects with 'text' and 'pageNumber' properties",
        });
      }

      await ChatSessionService.updatePDFContext(fileHash, pdfContext);
    }

    if (chatMessages && Array.isArray(chatMessages)) {
      // Add new messages to existing session
      for (const message of chatMessages) {
        await ChatSessionService.addMessage(fileHash, message);
      }
    }

    // Get the updated session
    const updatedSession = await ChatSessionService.getSessionByFileHash(
      fileHash
    );

    res.json({
      success: true,
      fileHash,
      message: "Chat session updated successfully",
      session: formatSessionResponse(updatedSession),
    });
  } catch (error) {
    console.error("Error in partialUpdateChatSession controller:", error);
    res.status(500).json({
      error: "Failed to update chat session",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete chat session
export const deleteChatSession = async (req: Request, res: Response) => {
  try {
    const { fileHash } = req.body;

    if (!fileHash) {
      return res.status(400).json({ error: "File hash is required" });
    }

    await ChatSessionService.deleteSession(fileHash);

    res.json({
      success: true,
      fileHash,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteChatSession controller:", error);
    res.status(500).json({
      error: "Failed to delete chat session",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Send message and get AI response (REST API version)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, systemPrompt, userId, fileHash } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!fileHash) {
      return res.status(400).json({ error: "File hash is required" });
    }

    const response = await aiService.sendMessage(message, systemPrompt);

    // Add messages to chat session
    await ChatSessionService.addMessage(fileHash, {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      userId,
      type: "user",
    });

    await ChatSessionService.addMessage(fileHash, {
      id: (Date.now() + 1).toString(),
      message: response,
      timestamp: new Date(),
      userId: "ai",
      type: "ai",
    });

    res.json({
      success: true,
      response,
      fileHash,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    res.status(500).json({
      error: "Failed to process message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
