const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');

const generateSessionId = () => {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let sessionId = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumeric.length);
    sessionId += alphanumeric.charAt(randomIndex);
  }

  console.log("sessionId generated: ", sessionId);
  return sessionId;
};

export default async function handler(req, res) {
  const sessionId = generateSessionId();
  console.log("sessionId generated in upload:", sessionId);

  if (req.method === 'POST') {
    try {
      await new Promise((resolve, reject) => {
        const form = new IncomingForm();
        const uploadDir = path.join(process.cwd(), sessionId);
        form.uploadDir = uploadDir; // Set the upload directory
        form.multiples = false; // Disable multiple file uploads
        form.maxFileSize = 10 * 1024 * 1024; // 10MB
        form.keepExtensions = true;

        // Check if directory exists, create it if it doesn't
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        form.on("file", (field, file) => {
          // Check if file was uploaded
          if (!file) {
            reject({ error: 'No file uploaded' });
            return;
          }
          // Check file extension
          const fileExtension = path.extname(file.originalFilename);
          if (fileExtension !== '.pdf') {
            reject({ error: 'Only PDF files are accepted' });
            return;
          }
          // File validation passed, continue with file handling
          fs.rename(
            file.filepath,
            path.join(uploadDir, file.originalFilename),
            () => {
              console.log(`Successfully renamed to ${path.join(uploadDir, file.originalFilename)}`);
            }
          );
        });

        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error('Error handling file upload:', err);
            reject({ error: 'Failed to process file upload' });
            return;
          }
          resolve();
        });
      });

      // Save sessionId in sessionid.json
      const sessionIdPath = path.join(process.cwd(), 'sessionid.json');
      fs.writeFileSync(sessionIdPath, JSON.stringify({ sessionId }));
      console.log('sessionid saved as: ', sessionId);
      // Send successful response
      console.log('Successfully uploaded to destinated folder');
      res.status(200).json({ success: true });
    } catch (error) {
      // Handle errors
      console.error('Error occurred:', error);
      res.status(500).json(error);
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

export const config = {
  api: {
    bodyParser: false
  },
};
