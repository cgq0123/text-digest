import { NextApiRequest, NextApiResponse } from 'next';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, getPineconeNameSpace, setPineconeNameSpace } from '@/config/pinecone';

const deleteNameSpace = async (req: NextApiRequest, res: NextApiResponse) => {
  const namespace = getPineconeNameSpace();
  console.log("namespace to delete:", namespace);
  if (namespace !== "default") {
    try {
      const index = pinecone.Index(PINECONE_INDEX_NAME);
      // delete namespace
      await index.delete1({
        deleteAll: true,
        namespace: namespace,
      });
      console.log("Pinecone Namespace deleted:", namespace);
      // reset namespace.json
      setPineconeNameSpace("default");
      console.log('Namespace reset to "default"');
      res.status(200).send({ message: 'Namespace deleted' });
    } 
    catch (error) {
      console.log('Error deleting namespace from Pinecone:', error);
      res.status(500).send({ error: 'Failed to delete namespace' });
    }
  } 
}

export default deleteNameSpace;