import { loadAndSplitFile } from "./loader";

async function test() {
  const docs = await loadAndSplitFile("./src/Dataset/ConceptsProductServices.csv");
  console.log(docs);
}

test();