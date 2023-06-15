import { Request, Response } from 'express';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeAnalysisChain } from '@/utils/makeanalysis';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, getPineconeNameSpace } from '@/config/pinecone';

export default async function handler(req: Request, res: Response) {
  try {
    const pineconeNameSpace = getPineconeNameSpace(); // Update the pineconeNameSpace value here

    console.log('analysis namespace', pineconeNameSpace)

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

    // Make analysis using the provided text
    const analysis = makeAnalysisChain(vectorStore);

    const analysisResponse = await analysis.call({'query': 'Analyse this document.'});

    // console.log('analysis', analysisResponse);
    res.status(200).json(analysisResponse);
  } catch (error) {
    console.error('Analysis API error:', error);
    res.status(500).json({ error: 'An error occurred while processing the analysis' });
  }
}
