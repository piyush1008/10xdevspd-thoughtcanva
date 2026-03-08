import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { model } from "./chatmodel.js";

// Map-reduce summarization chain
const mapTemplate = `The following is a set of documents:
{docs}
Based on this list of docs, please identify the main themes.
Helpful Answer:`;

const mapPrompt = PromptTemplate.fromTemplate(mapTemplate);

const reduceTemplate = `The following is set of summaries:
{doc_summaries}
Take these and distill it into a final, consolidated summary of the main themes.
Helpful Answer:`;

const reducePrompt = PromptTemplate.fromTemplate(reduceTemplate);

export const summarizationChain = RunnableSequence.from([
  {
    docs: (input: { input_documents: any[] }) => input.input_documents.map((doc: any) => doc.pageContent).join("\n\n"),
  },
  mapPrompt,
  model,
  {
    doc_summaries: (previousResult: any) => previousResult.content,
  },
  reducePrompt,
  model,
]);
