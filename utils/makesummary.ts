import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { loadQAStuffChain, loadSummarizationChain, VectorDBQAChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';

const SUMMARY_PROMPT = PromptTemplate.fromTemplate(
    `You are a helpful AI assistant that helps your reader to summarize text. You are given the following text from a document which could be from various sources. Only give factual answer that can be found in the document.

    {text}

    Summary:`
);

export const makeSummaryChain = (vectorstore: PineconeStore) => {
 
    const summaryChain = loadSummarizationChain(
        new OpenAI({
            temperature: 0.1,
            modelName: process.env.MODEL_NAME
        }),
    {
        prompt: SUMMARY_PROMPT,
    }
    );

    return new VectorDBQAChain({
            vectorstore,
            combineDocumentsChain: summaryChain,
            returnSourceDocuments: true,
            k: 5, //number of source documents to return. Change this figure as required.
    });
}

