import React, { createContext, useCallback, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChatMessage,
  ChatSessionResponse,
  NotebookProviderContext,
  PDFDocument,
} from "../types";
import {
  createOrUpdateChatSession,
  getChatSession,
} from "../services/notebook";
import { toast } from "@/shared/components/ui/toast";

const NotebookContext = createContext<NotebookProviderContext>(
  {} as NotebookProviderContext
);

interface Props extends React.PropsWithChildren {}

export function NotebookProvider({ children }: Props) {
  const [currentDocument, setCurrentDocument] = useState<PDFDocument>(
    {} as PDFDocument
  );
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const CHAT_SESSION_QUERY_KEY = ["chatSession", currentDocument?.fileHash];
  const {
    data: chatSession,
    isLoading: isChatSessionLoading,
    error: chatSessionError,
    refetch: refetchChatSession,
  } = useQuery({
    queryKey: CHAT_SESSION_QUERY_KEY,
    queryFn: () => getChatSession(currentDocument!.fileHash),
    enabled: !!currentDocument?.fileHash,
    staleTime: Infinity,
  });

  const createOrUpdateSessionMutation = useMutation({
    mutationFn: createOrUpdateChatSession,
    onSuccess: (data) => {
      if (data.success && data.session) {
        // Invalidate and refetch chat session
        queryClient.invalidateQueries({
          queryKey: CHAT_SESSION_QUERY_KEY,
        });
      }
    },
    onError: (error) => {
      console.error("Error creating/updating chat session:", error);
    },
  });

  const fetchOrCreateChatSession = useCallback(
    async (fileHash: string, pdfPages: string[]) => {
      try {
        const existingSession = await getChatSession(fileHash);

        if (existingSession.success && existingSession.session) {
          return existingSession.session;
        } else {
          const newSession = await createOrUpdateSessionMutation.mutateAsync({
            fileHash,
            pdfContext: pdfPages.map((page, index) => ({
              text: page,
              pageNumber: index + 1,
            })),
          });

          if (newSession.success && newSession.session) {
            return newSession.session;
          } else {
            throw new Error(
              newSession.error || "Failed to create chat session"
            );
          }
        }
      } catch (error) {
        console.error("Error fetching/creating chat session:", error);
        throw error;
      }
    },
    []
  );

  const handlePdfUpload = useCallback(
    async (document: PDFDocument, pdfPages: string[]) => {
      try {
        setCurrentDocument(document);

        await fetchOrCreateChatSession(document.fileHash, pdfPages);
      } catch (error) {
        console.error("Error handling PDF upload:", error);

        toast({
          title: "Error",
          description: (error as Error)?.message || "Error uploading PDF",
          variant: "destructive",
        });
      }
    },
    [fetchOrCreateChatSession]
  );

  const handleAddChatMessage = useCallback(
    async (message: ChatMessage | ChatMessage[], set?: boolean) => {
      queryClient.setQueryData(
        CHAT_SESSION_QUERY_KEY,
        (oldData: ChatSessionResponse) => {
          return {
            ...oldData,
            session: {
              ...oldData.session,
              chatMessages: set
                ? [...(Array.isArray(message) ? message : [message])]
                : [
                    ...(oldData?.session?.chatMessages || []),
                    ...(Array.isArray(message) ? message : [message]),
                  ],
            },
          };
        }
      );
    },
    [queryClient, CHAT_SESSION_QUERY_KEY]
  );

  const isLoading =
    isChatSessionLoading || createOrUpdateSessionMutation.isPending;

  const sessionData = chatSession?.success ? chatSession.session : null;

  const contextValue: NotebookProviderContext = {
    currentDocument,
    currentPdfPage,
    chatSession: sessionData ?? null,
    setCurrentPdfPage,
    setCurrentDocument,
    handlePdfUpload,
    isLoading,
    chatSessionError,
    refetchChatSession,
    currentUserId,
    setCurrentUserId,
    handleAddChatMessage,
  };

  return (
    <NotebookContext.Provider value={contextValue}>
      {children}
    </NotebookContext.Provider>
  );
}

export const useNotebook = () => {
  const context = useContext(NotebookContext);
  if (!context)
    throw new Error("useNotebook must be used within a NotebookProvider");

  return context;
};
