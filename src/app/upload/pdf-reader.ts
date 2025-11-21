"use server";

import { extractText } from "unpdf";

export async function pdfToText(data: Uint8Array) {
  const result = await extractText(data);
  return result.text || "";
}
