import { UIMessage, convertToModelMessages, streamText, tool, UIDataTypes, InferUITools, stepCountIs,} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { searchDocuments } from "@/lib/search";

/* ------------------ TOOLS ------------------ */
const tools = {
  searchKnowledgeBase: tool({
    description: "Search the knowledge base for relevant information",
    inputSchema: z.object({
      query: z.string().describe("Search query to find relevant documents"),
    }),
    execute: async ({ query }: any) => {
      try {
        const results = await searchDocuments(query, 3, 0.5);

        if (results.length === 0) {
          return "No relevant information found.";
        }

        const formatted = results
          .map((r, i) => `[${i + 1}] ${r.content}`)
          .join("\n\n");

        return formatted;
      } catch (error) {
        console.error("Search error:", error);
        return "Error searching the knowledge base.";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

/* ------------------ MODEL PROVIDER ------------------ */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

/* ------------------ ROUTE HANDLER ------------------ */
export async function POST(request: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();
    console.log(messages)

    const result = streamText({
      model: openrouter.chat("nvidia/nemotron-nano-12b-v2-vl:free"),
      messages: convertToModelMessages(messages),
      tools,
      system: `
              You are an AI assistant with:
              - access to a knowledge base,
              - ability to search using tools,
              - ability to analyze image/PDF attachments sent by the user.

              RULES:
              - Whenever the user asks, make use of the attachments they uploaded.
              - The attachments are sent as "experimental_attachments" with URLs. Treat them as real files.
              - For questions related to text, facts, summaries, refer to the knowledge base using the search tool.
              - Answer clearly and concisely.
              - If attachments are present, ALWAYS use them.
              - If the question may relate to uploaded documents, ALWAYS search the knowledge base before answering.
              `,
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in POST /chat:", error);
    return Response.json(
      { text: "Error generating response." },
      { status: 500 }
    );
  }
}
