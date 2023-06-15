import fs from 'fs';

const SESSION_ID_FILE_PATH = 'sessionid.json';

export function loadSessionId() {
  try {
    const data = fs.readFileSync(SESSION_ID_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Error reading namespace file:', error);
    return {};
  }
}

function saveSessionId(sessionid: any) {
  try {
    const data = JSON.stringify(sessionid);
    fs.writeFileSync(SESSION_ID_FILE_PATH, data, 'utf8');
    console.log('sessionId file saved successfully.');
  } catch (error) {
    console.log('Error saving sessionId file:', error);
  }
}

export function getSessionId() {
  const sessionid = loadSessionId();
  return sessionid.sessionId;
}

export function setSessionId(value: string) {
  const sessionid = loadSessionId();
  sessionid.sessionId = value;
  saveSessionId(sessionid);
}

  