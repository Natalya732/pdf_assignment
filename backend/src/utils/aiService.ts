import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

interface Citation {
  page: number;
  text: string;
}

interface AIResponseWithCitations {
  message: string;
  citations: Citation[];
}

class AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required in environment variables");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Send a message to OpenAI and get a response
   * @param message - The user's message
   * @param systemPrompt - Optional system prompt to guide the AI
   * @returns Promise<string> - The AI's response
   */
  async sendMessage(message: string, systemPrompt?: string): Promise<string> {
    try {
      const messages: any[] = [];

      if (systemPrompt) {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: message,
      });

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || "No response from AI";
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw new Error("Failed to get response from AI");
    }
  }

  /**
   * Send a message with conversation history and return structured response with citations
   * @param messages - Array of conversation messages
   * @param pdfContext - Array of PDF pages with text and page numbers
   * @returns Promise<AIResponseWithCitations> - The AI's response with citations
   */
  async sendMessageWithCitations(
    messages: Array<{ type: "user" | "ai"; message: string }>,
    pdfContext: Array<{ text: string; pageNumber: number; summary: string }>
  ): Promise<AIResponseWithCitations> {
    try {
      const conversationMessages: any[] = [];

      // Enhanced system prompt with citation instructions
      const enhancedSystemPrompt = `You are a helpful AI assistant. The user is asking questions about a PDF document. 
        
        IMPORTANT: When answering questions, you must:
        1. Base your answers on the provided PDF content
        2. Include specific page numbers for any information you reference
        3. Format your response as a JSON object with the following structure:
        {
          "message": "your answer in markdown",
          "citations": [
            {
              "page": page_number,
              "text": "exact text from the PDF",
            }
          ]
        }
        
        4. If you reference information from multiple pages, include citations for each page
        5. If the question is not related to the PDF content, provide general assistance without citations
       
        
        PDF Content by Page:
        ${pdfContext
          .map((page) => `Page ${page.pageNumber}: ${page.summary}`)
          .join("\n\n")}`;

      conversationMessages.push({
        role: "system",
        content: enhancedSystemPrompt,
      });

      conversationMessages.push(
        ...messages?.slice(-10)?.map((e) => ({
          content: e.message,
          role: e.type === "user" ? "user" : "assistant",
        }))
      );

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: conversationMessages,
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0]?.message?.content || "{}";

      try {
        const parsedResponse = JSON.parse(responseContent);
        return {
          message: parsedResponse.message || "No response from AI",
          citations: parsedResponse.citations || [],
        };
      } catch (parseError) {
        console.error("Error parsing AI response as JSON:", parseError);
        // Fallback to plain text response
        return {
          message: responseContent,
          citations: [],
        };
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw new Error("Failed to get response from AI");
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
export default aiService;
export type { AIResponseWithCitations, Citation };
