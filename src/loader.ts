import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Loads a text file and splits it into smaller chunks for the AI.
 * @param path - The relative path to the file.
 * @returns Array of Document objects. */
export const loadAndSplitFile = async (inputPath: string): Promise<Document[]> => {
  console.log(`📂 Loading path: ${inputPath}...`);
  console.log(`[DEBUG] Absolute path attempt: ${require("path").resolve(inputPath)}`);

  try {
    // Support glob/wildcard patterns (e.g., './src/Dataset/*')
    let filePaths: string[] = [];
    if (inputPath.includes("*")) {
      const resolved = path.resolve(inputPath);
      // Determine directory to read (strip trailing glob part)
      const dir = resolved.replace(/\*.*$/, "");
      console.log(`[DEBUG] Glob detected. Reading directory: ${dir}`);
      const entries = await fs.readdir(dir);
      // Filter for common data file types (CSV, TXT, MD, JSON)
      const files = entries.filter((f) => /\.(csv|txt|md|json)$/i.test(f));
      filePaths = files.map((f) => path.join(dir, f));
    } else {
      filePaths = [path.resolve(inputPath)];
    }

    console.log(`[DEBUG] Files to load: ${filePaths.length}`);

    const allRawDocs: Document[] = [];
    for (const fp of filePaths) {
      try {
        console.log(`[DEBUG] Creating TextLoader for: ${fp}`);
        const loader = new TextLoader(fp);
        const rawDocs = await loader.load();
        console.log(`[DEBUG] ✓ Loaded ${rawDocs.length} doc(s) from ${fp}`);
        rawDocs.forEach((doc, idx) => {
          console.log(`[DEBUG]   Doc ${idx + 1} from ${path.basename(fp)} - Length: ${doc.pageContent.length}`);
        });
        allRawDocs.push(...rawDocs);
      } catch (innerErr) {
        console.warn(`[WARN] Failed to load ${fp}:`, innerErr);
      }
    }

    // 3. Initialize the splitter
    // chunkSize: How many characters per chunk (1000 is a safe starting point)
    // chunkOverlap: How many characters overlap between chunks (prevents cutting sentences in half)
    console.log("[DEBUG] Creating RecursiveCharacterTextSplitter...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });
    console.log("[DEBUG] ✓ Splitter configured (chunkSize: 1000, overlap: 100)");

    // 4. Split the text
    console.log("[DEBUG] Splitting documents into chunks...");
    const splitDocs = await splitter.splitDocuments(allRawDocs);
    console.log(`✅ Files loaded and split into ${splitDocs.length} chunks.`);
    
    splitDocs.forEach((doc, idx) => {
      if (idx < 3 || idx >= splitDocs.length - 2) { // Show first 3 and last 2
        console.log(`[DEBUG]   Chunk ${idx + 1}: ${doc.pageContent.substring(0, 80)}...`);
      } else if (idx === 3) {
        console.log(`[DEBUG]   ... (${splitDocs.length - 5} more chunks) ...`);
      }
    });

    return splitDocs;
  } catch (error) {
    console.error("[DEBUG] Error during file loading/splitting:", error);
    console.error("[DEBUG] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};