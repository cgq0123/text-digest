import { Request, Response } from 'express';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeSummaryChain } from '@/utils/makesummary';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, getPineconeNameSpace } from '@/config/pinecone';

export default async function handler(req: Request, res: Response) {
  try {
    const pineconeNameSpace = await getPineconeNameSpace();
    
    console.log('summary namespace', pineconeNameSpace)

    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* Create vectorstore */
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: pineconeNameSpace,
      },
    );

    // Make summary using the provided text
    const summary = makeSummaryChain(vectorStore);

    const summaryResponse = await summary.call({ query: 'Give me a detailed summary of the document.' });

    // console.log('summary', summaryResponse);
    res.status(200).json(summaryResponse);
  } catch (error) {
    console.error('Summary API error:', error);
    res.status(500).json({ error: 'An error occurred while processing the summary' });
  }
}
