import * as dotenv from "dotenv";
import createVectorIndexesFromDataset from "./vector_index";

dotenv.config();

async function main() {
  try {
    await createVectorIndexesFromDataset();
    console.log("Done.");
  } catch (err) {
    console.error("Error creating vector indexes:", err);
    process.exitCode = 1;
  }
}

main();
