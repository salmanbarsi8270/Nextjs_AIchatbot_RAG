"use server";

import { pdfToText } from "./pdf-reader";
import { db } from "@/lib/db-config";
import { documents } from "@/lib/db-schema";
import { generateEmbeddingsMany } from "@/lib/embeddings";
import { chunkcontent } from "@/lib/chunking";

export async function processpdfFile(formData: FormData) {
  try {
    const file = formData.get("pdf") as File;
    const bytes = await file.arrayBuffer();
    const uint8 = new Uint8Array(bytes);

    const textOutput = await pdfToText(uint8);
    const text = Array.isArray(textOutput) ? textOutput.join("\n") : textOutput;

    if (!text || !text.trim()) {
      return { success: false, error: "No extractable text found." };
    }

    const rawChunks = await chunkcontent(text);
    const chunks = Array.isArray(rawChunks) ? rawChunks : [rawChunks];

    console.log("CHUNKS:", chunks);

    const embeddingResponse:any = await generateEmbeddingsMany(chunks);
    console.log("EMBEDDINGS RESPONSE...:", embeddingResponse);

    const embedData = embeddingResponse.data;
    console.log(embedData, "embedData")

    await db.insert(documents).values(
      chunks.map((chunk, index) => ({
        content: chunk,
        embedding: embedData[index].embedding,  
      }))
    );

    return {
      success: true,
      message: "PDF processed & stored successfully.",
    };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed to process PDF" };
  }
}
