import React, { useEffect, useState, useCallback } from "react";
import { ChatMessage } from "@features/notebook/types";
import { ChatInterface } from "./ChatInterface";
import useSocket from "@/shared/hooks/useSocket";
import { SOCKET_EVENTS } from "@/shared/constants/socket";
import { toast } from "@/shared/components/ui/toast";
import { useNotebook } from "../../context/NotebookProvider";

interface ChatFeatureProps {
  disabled?: boolean;
}

export const ChatSection: React.FC<ChatFeatureProps> = ({
  disabled = false,
}) => {
  const { socket } = useSocket();
  const {
    currentDocument,
    chatSession,
    isLoading: providerLoading,
    chatSessionError,
    refetchChatSession,
    currentUserId,
    setCurrentUserId,
    handleAddChatMessage,
  } = useNotebook();
  const [isLoading, setIsLoading] = useState(false);

  const fileHash = currentDocument?.fileHash;

  const handleChatHistory = useCallback(
    (data: { fileHash: string; messages: any[] }) => {
      if (data.fileHash === fileHash) {
        const convertedMessages: ChatMessage[] = data.messages.map((msg) => ({
          id: msg.id,
          message: msg.message,
          type: msg.type === "user" ? "user" : "ai",
          timestamp: new Date(msg.timestamp),
        }));
        handleAddChatMessage(convertedMessages, true);
      }
    },
    [fileHash]
  );

  const handleMessageReceived = useCallback(
    (data: { fileHash: string; message: string; type: string }) => {
      if (data.fileHash === fileHash && data.type === "user") {
        setIsLoading(true);
      }
    },
    [fileHash]
  );

  const handleAIResponse = useCallback(
    (data: { fileHash: string; message: string; type: string }) => {
      if (data.fileHash === fileHash && data.type === "ai") {
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          message: data.message,
          type: "ai",
          timestamp: new Date(),
        };
        handleAddChatMessage(aiMessage);
        setIsLoading(false);

        refetchChatSession();
      }
    },
    [fileHash, refetchChatSession]
  );

  const handleError = useCallback(
    (error: { message: string; error: string }) => {
      console.error("Socket error:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: error?.message,
        variant: "destructive",
      });
    },
    []
  );

  const handleUserJoinedFile = useCallback(
    (data: { fileHash: string; userId: string }) => {
      if (data.fileHash === fileHash) {
        setCurrentUserId(data.userId);
      }
    },
    [fileHash, setCurrentUserId]
  );

  useEffect(() => {
    if (chatSessionError) {
      toast({
        title: "Error",
        description: "Failed to load chat session. Please try again.",
        variant: "destructive",
      });
    }
  }, [chatSessionError]);

  useEffect(() => {
    if (!socket) return;

    if (fileHash && chatSession) {
      socket.emit(SOCKET_EVENTS.JOIN_FILE, { fileHash });
    }

    socket.on(SOCKET_EVENTS.CHAT_HISTORY, handleChatHistory);
    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
    socket.on(SOCKET_EVENTS.AI_RESPONSE, handleAIResponse);
    socket.on(SOCKET_EVENTS.ERROR, handleError);
    socket.on(SOCKET_EVENTS.USER_JOINED_FILE, handleUserJoinedFile);

    // Cleanup
    return () => {
      if (fileHash) {
        socket.emit(SOCKET_EVENTS.LEAVE_FILE, { fileHash });
      }

      socket.off(SOCKET_EVENTS.CHAT_HISTORY, handleChatHistory);
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
      socket.off(SOCKET_EVENTS.AI_RESPONSE, handleAIResponse);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
      socket.off(SOCKET_EVENTS.USER_JOINED_FILE, handleUserJoinedFile);
    };
  }, [socket, fileHash]);

  const handleSendMessage = async (content: string) => {
    if (!socket || !fileHash || !chatSession) {
      console.error(
        "Socket not connected, fileHash not provided, or no chat session"
      );
      toast({
        title: "Error",
        description:
          "Chat session not ready. Please wait for the document to load.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: content,
      type: "user",
      timestamp: new Date(),
    };

    handleAddChatMessage(userMessage);
    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      message: content,
      fileHash,
      userId: currentUserId,
    });
  };

  const isDisabled = disabled || !fileHash || !chatSession || providerLoading;

  return (
    <ChatInterface
      messages={chatSession?.chatMessages ?? []}
      onSendMessage={handleSendMessage}
      disabled={isDisabled}
      isLoading={isLoading}
    />
  );
};
