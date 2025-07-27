import express from "express";
import {
  sendMessage,
  createOrUpdateChatSession,
  getChatSession,
  partialUpdateChatSession,
  deleteChatSession,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/session/create", createOrUpdateChatSession); // Create or update session
router.post("/session/get", getChatSession); // Get session by fileHash
router.post("/session/update", partialUpdateChatSession); // Partial update
router.post("/session/delete", deleteChatSession); // Delete session

router.post("/send", sendMessage); // Send message via REST API

export default router;
