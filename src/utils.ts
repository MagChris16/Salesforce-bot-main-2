import { Document } from "@langchain/core/documents";

// Helper function to turn an array of documents into a single string
export const combineDocuments = (docs: Document[]): string => {
  return docs.map((doc) => doc.pageContent).join("\n\n---\n\n");
};