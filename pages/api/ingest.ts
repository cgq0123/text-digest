import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { PINECONE_INDEX_NAME, setPineconeNameSpace } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';
import { promises as fsPromises } from 'fs';
import { getSessionId } from '@/config/sessionId';

/* Name of directory to retrieve your files from */
const sessionid = getSessionId();
console.log("sessionId received in ingest:", sessionid);  
const filePath = sessionid;

const ingestFunction = async (req: NextApiRequest, res: NextApiResponse) => {
  try {

    /* Load raw docs from all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path: string) => new CustomPDFLoader(path),
    });
  
    const rawDocs = await directoryLoader.load();

    // Get the list of PDF file names (now assume only one file)
    const fileNames = (await fsPromises.readdir(filePath))
    .filter(file => file.endsWith('.pdf'));

    if (fileNames.length === 0) {
      throw new Error('No PDF files found in the directory');
    }

    // Assuming only one PDF file, extract the name without the extension
    const pdfFileName = fileNames[0].replace('.pdf', '');
    
    const suffix = pdfFileName;
    console.log('File Name:', suffix);

    const namespace = sessionid + '-' + suffix;
    console.log('Namespace:', namespace);
    // update the PINECONE_NAME_SPACE dynamically
    setPineconeNameSpace(namespace);

    try {
      // Call the fullIngestion function
      await fullIngestion(rawDocs, namespace);
      await deleteFiles(filePath);
      res.status(200).send({ message: 'Ingestion completed' });
    } catch (error) {
      await deleteFiles(filePath);
      console.log('Error during ingestion:', error);
      res.status(500).send({ error: 'Failed to ingest data' });
    }
  } catch (error) {
    await deleteFiles(filePath);
    console.log('error', error);
    res.status(500).send({ error: 'Try Reloading' });
  }
};

async function deleteFiles(directoryPath: string): Promise<void> {
  const files = await fsPromises.readdir(filePath);
  const deletePromises = files.map((file) =>
    fsPromises.unlink(join(filePath, file))
  );
  await Promise.all(deletePromises);
  console.log('Files deleted');
}

async function fullIngestion(rawDocs: any[], namespace: string) {
  /* Ingestion - Split text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await textSplitter.splitDocuments(rawDocs);
  // console.log('split docs', docs);

  console.log('creating vector store:', namespace);
  
  /*create and store the embeddings in the vectorStore*/
  const embeddings = new OpenAIEmbeddings();
  const index = pinecone.Index(PINECONE_INDEX_NAME);

  // Embed the PDF documents
  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex: index,
    namespace: namespace,
    textKey: 'text',
  });
}

export default ingestFunction;