import fs from 'fs';

const NAMESPACE_FILE_PATH = 'namespace.json';

export function loadNameSpace() {
  try {
    const data = fs.readFileSync(NAMESPACE_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Error reading namespace file:', error);
    return {};
  }
}

function saveNameSpace(namespace: any) {
  try {
    const data = JSON.stringify(namespace);
    fs.writeFileSync(NAMESPACE_FILE_PATH, data, 'utf8');
    console.log('Namespace file saved successfully.');
  } catch (error) {
    console.log('Error saving namespace file:', error);
  }
}

export function getPineconeNameSpace() {
  const namespace = loadNameSpace();
  return namespace.PINECONE_NAME_SPACE;
}

export function setPineconeNameSpace(value: string) {
  const namespace = loadNameSpace();
  namespace.PINECONE_NAME_SPACE = value;
  saveNameSpace(namespace);
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing Pinecone index name in .env file');
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

export { PINECONE_INDEX_NAME };