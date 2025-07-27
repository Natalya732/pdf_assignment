import React from "react";
import { Loader2, Server } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Waking up the servers...",
  subMessage = "This might take a few moments, please wait.",
}) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        {/* Animated server icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6">
            <div className="relative w-full h-full">
              {/* Server base */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg flex items-center justify-center">
                <Server className="w-12 h-12 text-white" />
              </div>

              {/* Animated pulse rings */}
              <div className="absolute inset-0 rounded-xl border-2 border-purple-400 animate-ping opacity-75"></div>
              <div
                className="absolute inset-0 rounded-xl border-2 border-blue-400 animate-ping opacity-75"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {message}
          </h1>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            {subMessage}
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};