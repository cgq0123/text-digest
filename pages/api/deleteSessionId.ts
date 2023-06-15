import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionId, loadSessionId, setSessionId } from '@/config/sessionId';
import fs from 'fs-extra';

const deleteNameSpace = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionid = getSessionId();
  if (sessionid !== "default") {
    try {
      // Delete folder
      await fs.remove(`./${sessionid}`);
      console.log("Session folder deleted: ./", sessionid);
      // reset sessionid.json
      setSessionId("default");
      console.log('sessionid reset to "default"');
      res.status(200).send({ message: 'sessionid deleted' });
    } 
    catch (error) {
      console.log('Error deleting sessionid:', error);
      res.status(500).send({ error: 'Failed to delete sessionid' });
    }
  } 
}

export default deleteNameSpace;