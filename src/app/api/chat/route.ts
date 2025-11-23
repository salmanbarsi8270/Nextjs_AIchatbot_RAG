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
    const result = await streamText({
      model: openrouter.chat(model),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("RAG Error:", error);
    
    return Response.json(
      { 
        error: "RAG processing failed", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}