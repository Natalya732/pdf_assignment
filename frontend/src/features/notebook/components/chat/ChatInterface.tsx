import React, { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import {
  ChatMessage as ChatMessageType,
  Citation,
  PDFDocument,
} from "@features/notebook/types";
import { MessageCircleMore, Plus } from "lucide-react";
import { useNotebook } from "../../context/NotebookProvider";
import { Button } from "@/shared/components/ui/button";

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  disabled = false,
  isLoading = false,
}) => {
  const { setCurrentPdfPage, setCurrentDocument, isLoading: providerLoading } = useNotebook();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const isCurrentlyLoading = isLoading !== undefined ? isLoading : localLoading;

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    };

    // Small delay to ensure DOM is updated
    setTimeout(scrollToBottom, 100);
  }, [messages, isCurrentlyLoading]);

  const handleSendMessage = async (message: string) => {
    if (isLoading === undefined) {
      setLocalLoading(true);
    }

    try {
      await onSendMessage(message);
    } finally {
      if (isLoading === undefined) {
        setLocalLoading(false);
      }
    }
  };

  const handleCitationClick = (citation: Citation) => {
    if (citation.page) {
      setCurrentPdfPage(citation.page);
    }
  };

  const handleUploadNew = () => {
    setCurrentDocument({} as PDFDocument)
    setCurrentPdfPage(1)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex gap-2 items-center justify-end p-4">
        <Button
          variant={"outline"}
          onClick={handleUploadNew}
        ><Plus /> Upload New PDF</Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea
          className="h-full"
          ref={scrollAreaRef}
          viewportClassName="[&>div]:!block"
        >
          <div className="p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-600 py-12">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircleMore className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">
                  Start a conversation!
                </p>
                <p className="text-sm text-gray-500">
                  Ask questions about your PDF content
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onCitationClick={handleCitationClick}
                />
              ))
            )}

            {isCurrentlyLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg px-3 py-2">
                  <div className="text-sm text-gray-700 font-medium">
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator className="bg-gradient-to-r from-purple-200 to-blue-200" />

      {
        providerLoading ? <div className="relative p-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-ping opacity-75 absolute"></div>
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing the PDF...</span>
            </div>
          </div>
          <div className="opacity-40 pointer-events-none">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={true}
            />
          </div>
        </div> :
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={disabled || isCurrentlyLoading}
          />
      }

    </div>
  );
};
