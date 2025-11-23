// src/app/api/rag/route.ts
import { searchDocuments } from "@/lib/search";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Request body:", JSON.stringify(body, null, 2));

    // Extract user query
    let query = "";
    let model = ""

    // Option 1: Direct query field (from custom body)
    if (body.query && typeof body.query === "string") {
      query = body.query;
    }
    if (body.model && typeof body.model === "string") {
      model = body.model;
    }
    
    if (!query || typeof query !== "string" || query.trim() === "") {
      return Response.json(
        { error: "Query must be a non-empty string" },
        { status: 400 }
      );
    }
    if (!model || typeof model !== "string" || model.trim() === "") {
      return Response.json(
        { error: "model must be a non-empty string" },
        { status: 400 }
      );
    }

    console.log("Extracted Query:", query);

    // 1) RAG Search
    const results = await searchDocuments(query, 5, 0.4);
    const context = results.length > 0 ? results .map((r: any, i: number) => `[Document ${i + 1}] ${r.content}`).join("\n\n") : "No relevant documents found in the database.";

    console.log("RAG Search Results:", results.length, "documents found");
    console.log("RAG context Results:", context);

    // 2) Build system prompt with context
    const systemPrompt = `You are a helpful AI assistant with access to a document database.
    
    Retrieved Context from Database:
    ${context}
    
    Instructions:
      - Use the context above to answer the user's question accurately
      - If the context contains relevant information, cite it naturally in your response
      - If the context doesn't contain relevant information, provide no document message
      - Be concise and clear`;

    console.log("System Prompt Length:", systemPrompt);

    // 3) Stream AI Response
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

    // Use toDataStreamResponse for better compatibility
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