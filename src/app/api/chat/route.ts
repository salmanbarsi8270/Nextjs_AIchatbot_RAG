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

    // Get last user message
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();

    if (!lastUserMessage || !lastUserMessage.content) {
      return Response.json(
        { error: "No user message found" },
        { status: 400 }
      );
    }

    // ---- 🔥 FIX: SUPPORT ARRAY CONTENT ----
    let query = lastUserMessage.content;

    if (Array.isArray(query)) {
      query = query.join(" "); // merge chunks
    }

    if (typeof query !== "string") {
      query = String(query);
    }

    console.log("Extracted Query:", query);
    console.log("Selected Model:", model);

    // 1) RAG search
    const results = await searchDocuments(query, 5, 0.4);

    const context =
      results.length > 0
        ? results
            .map((r: any, i: number) => `[Document ${i + 1}] ${r.content}`)
            .join("\n\n")
        : "No relevant documents found.";

    console.log("RAG Search Results:", results.length, "documents found");

    // 2) System prompt
    const systemPrompt = `You are a helpful AI assistant with access to a document database.

Retrieved Context from Database:
${context}

Instructions:
- You are running on model: ${model}
- Use the context above to answer the user's question accurately.
- If the context helps, cite document numbers in your replies.
- If the context has no relevant info, say so.
- Be clear, concise, and helpful.`;


    // 3) Call LLM
    const result = await streamText({
      model: openrouter.chat(model),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("RAG Error:", error);

    return Response.json(
      {
        error: "RAG processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
