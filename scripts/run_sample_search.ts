import "dotenv/config";
import { vectorSearch } from "../src/search/vector_search";
import { textSearch } from "../src/search/text_search";

async function main() {
  console.log("ENV flags:");
  console.log(" VECTOR_SEARCH_ENABLED=", process.env.VECTOR_SEARCH_ENABLED);
  console.log(" BM25_SEARCH_ENABLED=", process.env.BM25_SEARCH_ENABLED);

  console.log("\n1) Running vectorSearch (should be disabled when VECTOR_SEARCH_ENABLED=false)");
  try {
    const dummyVector = Array(1024).fill(0.001);
    const vres = await vectorSearch(dummyVector, 3);
    if (Array.isArray(vres)) {
      console.log(" vectorSearch returned: hits=", vres.length);
    } else {
      console.log(" vectorSearch returned:", vres);
    }
  } catch (err) {
    console.error(" vectorSearch error:", err);
  }

  console.log("\n2) Running textSearch (should be disabled when BM25_SEARCH_ENABLED=false)");
  try {
    const tres = await textSearch("license update sandbox", "content", 3);
    if (Array.isArray(tres)) {
      console.log(" textSearch returned: hits=", tres.length);
    } else {
      console.log(" textSearch returned:", tres);
    }
  } catch (err) {
    console.error(" textSearch error:", err);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
