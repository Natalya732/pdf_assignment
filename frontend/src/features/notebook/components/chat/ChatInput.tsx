import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Ask a question about the PDF...",
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="flex items-center gap-2 p-3 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[40px] max-h-24 resize-none border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/80 backdrop-blur-sm rounded-xl"
          rows={1}
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        size="sm"
        variant="gradient"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
