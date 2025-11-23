// src/app/api/chat/route.ts
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { searchDocuments } from "@/lib/search";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,  
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body));

    const messages = body.messages || [];
    const model = body.data?.model || body.model || "nvidia/nemotron-nano-12b-v2-vl:free";

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Get the last user message for RAG search
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();

    if (!lastUserMessage || !lastUserMessage.content) {
      return Response.json(
        { error: "No user message found" },
        { status: 400 }
      );
    }

    const query = lastUserMessage.content;

    console.log("Extracted Query:", query);
    console.log("Selected Model:", model);

    // 1) RAG Search
    const results = await searchDocuments(query, 5, 0.4);
    
    const context = results.length > 0 ? results .map((r: any, i: number) => `[Document ${i + 1}] ${r.content}`) .join("\n\n") : "No relevant documents found in the database.";

    console.log("RAG Search Results:", results.length, "documents found");

    // 2) Build system prompt with context
    const systemPrompt = `You are a helpful AI assistant with access to a document database.

Retrieved Context from Database:
${context}

Instructions:
- Use the context above to answer the user's question accurately
- If the context contains relevant information, cite it naturally in your response
- If the context doesn't contain relevant information, provide a helpful message that no relevant documents were found
- Be concise and clear`;

    console.log("System Prompt created");

    // 3) Clean and format messages for the model
    const cleanedMessages = messages
      .map((msg: any) => {
        // Handle user messages
        if (msg.role === 'user') {
          return {
            role: 'user' as const,
            content: typeof msg.content === 'string' ? msg.content : msg.content || '',
          };
        }
        // Handle assistant messages - extract text from parts if present
        else if (msg.role === 'assistant') {
          let textContent = '';
          
          if (typeof msg.content === 'string') {
            textContent = msg.content;
          } else if (msg.parts && Array.isArray(msg.parts)) {
            // Extract text from parts array
            textContent = msg.parts
              .filter((part: any) => part.type === 'text')
              .map((part: any) => part.text)
              .join('\n');
          } else if (Array.isArray(msg.content)) {
            textContent = msg.content
              .filter((part: any) => part.type === 'text')
              .map((part: any) => part.text || '')
              .join('\n');
          }
          
          return {
            role: 'assistant' as const,
            content: textContent || 'No response',
          };
        }
        
        return null;
      })
      .filter((msg): msg is { role: 'user' | 'assistant'; content: string } => msg !== null);

    // 4) Build final messages array with system prompt
    const finalMessages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...cleanedMessages,
    ];

    // 4) Stream AI Response
    const result = streamText({
      model: openrouter.chat(model),
      messages: finalMessages,
    });

    // Use toDataStreamResponse for useChat
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    
    return Response.json(
      { 
        error: "Chat processing failed", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}