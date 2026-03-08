import { summarizationChain } from "./loadsummarization";
import { splitter } from "./textSplitter";

export async function summarizeText(text: string) {
    // 1. Split text
    const docs = await splitter.createDocuments([text]);
  
    // 2. Run summarization chain
    const result = await summarizationChain.invoke({
      input_documents: docs
    });

    console.log(`Result ${result}`)
  
    return result.content;
  }
  