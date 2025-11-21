import { OpenRouterCore } from "@openrouter/sdk/core.js";
import { embeddingsGenerate } from "@openrouter/sdk/funcs/embeddingsGenerate.js";


const openRouter = new OpenRouterCore({
  apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
});

export async function generateEmbeddingsMany(texts: string[]) {
  const cleaned = texts.map((text) => text.replaceAll("\n", " "));
  const res = await embeddingsGenerate(openRouter, {
    input: cleaned,
    model: "thenlper/gte-base",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
    return result
  } else {
    console.log("embeddingsGenerate failed:", res.error);
  }
}
