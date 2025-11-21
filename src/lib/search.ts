// src/lib/search.ts
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { db } from "./db-config";
import { documents } from "./db-schema";
import { generateEmbeddingsMany } from "./embeddings";

export async function searchDocuments(
  query: string,
  limit = 5,
  threshold = 0.5
) {
  // Generate embedding for query
  const embedRes:any = await generateEmbeddingsMany([query]);

  if (!embedRes) {
    console.error("Embedding generator returned null");
    return [];
  }

  // Extract correct vector format
  const vector =
    embedRes.data?.[0]?.embedding ||
    embedRes[0]?.embedding ||
    embedRes[0] ||
    null;

  if (!vector || !Array.isArray(vector)) {
    console.error("Invalid embedding:", vector);
    return [];
  }

  // ⭐ FIX → Neon requires [1,2,3] not {1,2,3}
  const pgVector = `[${vector.join(",")}]`;

  // Build similarity SQL
  const similarity = sql<number>`
    1 - (${cosineDistance(documents.embedding, pgVector)})
  `;

  // Query Neon
  const rows = await db
    .select({
      id: documents.id,
      content: documents.content,
      similarity,
    })
    .from(documents)
    .where(gt(similarity, threshold))
    .orderBy(desc(similarity))
    .limit(limit);

  return rows;
}
