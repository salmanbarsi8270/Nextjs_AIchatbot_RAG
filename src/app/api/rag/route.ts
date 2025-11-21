// src/app/api/rag/route.ts
import { searchDocuments } from "@/lib/search";

export async function POST(req: Request) {
  const { query } = await req.json();

  const results = await searchDocuments(query, 5, 0.4);

  return Response.json({ results });
}
