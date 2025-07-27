import React from "react";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { User, Bot, FileText } from "lucide-react";
import {
  ChatMessage as ChatMessageType,
  Citation,
} from "@features/notebook/types";
import { getAmPmTimeFromUTC } from "@/shared/utils/date";

interface ChatMessageProps {
  message: ChatMessageType;
  onCitationClick?: (citation: Citation) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onCitationClick,
}) => {
  const isUser = message.type === "user";

  const renderContent = (content: string, citations?: Citation[]) => {
    if (!citations || citations.length === 0) {
      return <span className="whitespace-pre-wrap">{content}</span>;
    }

    const uniquePages = [...new Set(citations.map((c) => c.page))].sort(
      (a, b) => a - b
    );

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {uniquePages.map((page) => (
            <Button
              key={page}
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-1 text-xs h-6 px-2 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 text-purple-700 hover:from-purple-200 hover:to-blue-200"
              onClick={() => {
                const citation = citations.find((c) => c.page === page);
                if (citation) onCitationClick?.(citation);
              }}
            >
              <FileText className="h-3 w-3" />
              Page {page}
            </Button>
          ))}
        </div>

        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    );
  };

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-7 w-7 ring-1 ring-purple-200 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
            <Bot className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-[75%] ${
          isUser
            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            : "bg-white border border-gray-200 shadow-sm"
        } rounded-2xl px-3 py-2 text-sm leading-[1.5]`}
      >
        {renderContent(message.message, message.citations)}
        <div
          className={`text-xs mt-1 ${
            isUser ? "text-purple-100" : "text-gray-400"
          }`}
        >
          {getAmPmTimeFromUTC(message.timestamp)}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-7 w-7 ring-1 ring-blue-200 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
            <User className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
