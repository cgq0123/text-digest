import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { loadQAChain, loadQAStuffChain, loadSummarizationChain, VectorDBQAChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';

const ANALYSIS_PROMPT = PromptTemplate.fromTemplate(
    `You are a helpful AI assistant that helps your reader to perform text analysis. You are given the following text from a document which could be from various sources. Please analyse the text and stay close to the context in your response.

    {text}

    Analysis:`
);

export const makeAnalysisChain = (vectorstore: PineconeStore) => {
 
    const analysisChain = loadSummarizationChain(
        new OpenAI({
            temperature: 0.5,
            modelName: process.env.MODEL_NAME
        }),
    {
        prompt: ANALYSIS_PROMPT,
    }
    );

    return new VectorDBQAChain({
            vectorstore,
            combineDocumentsChain: analysisChain,
            returnSourceDocuments: true,
            k: 5, //number of source documents to return. Change this figure as required.
    });
}

