import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 20,
    separators: [""],
});

export async function chunkcontent(content: string) {
    return await textSplitter.splitText(content.trim());
}