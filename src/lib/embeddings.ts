// src/lib/embeddings.ts
import { OpenRouterCore } from "@openrouter/sdk/core";
import { embeddingsGenerate } from "@openrouter/sdk/funcs/embeddingsGenerate";

const openrouter = new OpenRouterCore({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

export async function generateEmbeddingsMany(texts: string[]) {
  const cleaned = texts.map((t) => t.replace(/\n/g, " "));

  const res:any = await embeddingsGenerate(openrouter, {
    input: cleaned,
    model: "thenlper/gte-base",
  });

  if (!res.ok) {
    console.error("Embedding error:", res.error);
    return null;
  }

  // ⭐ Return clean vector array (not metadata)
  return res.value.data.map((row: any) => row.embedding);
}
