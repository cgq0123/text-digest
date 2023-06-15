import React, { ChangeEvent, KeyboardEvent } from 'react';
import { Message } from '@/types/chat';
import { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Document } from 'langchain/document';
import styles from '@/styles/Home.module.css';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Home() {
  const [sessionEnded, setSessionEnded] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [deleteIDResponse, setDeleteIDResponse] = useState<string>('');
  const [deleteNSResponse, setDeleteNSResponse] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [ingestResponse, setIngestResponse] = useState<string>('');
  const [summaryResponse, setSummaryResponse] = useState<string>('');
  const [analysisResponse, setAnalysisResponse] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    history: [string, string][];
    pending?: string;
    pendingSourceDocs?: Document[];
  }>({
    messages: [],
    history: [],
  });
  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
    const handleUnload = async () => {
      setSessionEnded(true);
      console.log('Session Ended: Unloaded');

      // Call the server-side endpoint or function to delete the namespace
      try {
        await Promise.all([fetchDeleteID(), fetchDeleteNS()]);
        console.log('Unloaded: NS and ID cleaned');
      } catch (error) {
        console.error('Error deleting namespace on the server side:', error);
      }
      setIsUploaded(false);
    };

    // const handleVisibilityChange = async () => {
    //   if (document.hidden) {
    //     setSessionEnded(true);
    //     // Perform any necessary cleanup or session termination actions here
    //     console.log("Session Ended: Visibility Changed");
    //     // Call the server-side endpoint or function to delete the namespace
    //     try {
    //       await Promise.all([fetchDeleteID(), fetchDeleteNS()]);
    //       console.log('Visibility Changed: NS and ID cleaned');
    //     } catch (error) {
    //       console.error('Error deleting namespace on the server side:', error);
    //     }
    //   }
    // };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ''; // Required for Chrome compatibility
      handleUnload();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // // Check session status periodically
  // useEffect(() => {
  //   const checkSessionStatus = async () => {
  //     try {
  //       const response = await fetch('/api/checkSessionStatus');
  //       if (response.ok) {
  //         const data = await response.json();
  //         const { sessionActive } = data; // Adjust the response data based on your server implementation

  //         if (!sessionActive) {
  //           setSessionEnded(true);
  //           // Perform any necessary cleanup or session termination actions here
  //         }
  //       } else {
  //         console.error('Error checking session status:', response.status);
  //       }
  //     } catch (error) {
  //       console.error('Error checking session status:', error);
  //     }
  //   };

  //   const interval = setInterval(checkSessionStatus, 60000); // Adjust the interval as needed

  //   return () => clearInterval(interval);
  // }, []);

  const fetchDeleteID = async (): Promise<void> => {
    try {
      const deleteIDResponse = await fetch('/api/deleteSessionId');
      const deleteIDData = await deleteIDResponse.json();

      //debug
      console.log('deleteIDResponse:', deleteIDResponse);

      if (deleteIDResponse.ok) {
        setDeleteIDResponse(deleteIDData.text);
      } else {
        console.error('DeleteID API error:', deleteIDData.error);
      }
    } catch (error) {
      console.error('DeleteID API error:', error);
    }
  };

  const fetchDeleteNS = async (): Promise<void> => {
    try {
      const deleteNSResponse = await fetch('/api/deleteNameSpace');
      const deleteNSData = await deleteNSResponse.json();

      //debug
      console.log('deleteNSResponse:', deleteNSResponse);

      if (deleteNSResponse.ok) {
        setDeleteNSResponse(deleteNSData.text);
      } else {
        console.error('DeleteNS API error:', deleteNSData.error);
      }
    } catch (error) {
      console.error('DeleteNS API error:', error);
    }
  };

  const fetchIngest = async (): Promise<void> => {
    try {
      const ingestResponse = await fetch('/api/ingest');
      const ingestData = await ingestResponse.json();

      //debug
      console.log('ingestResponse:', ingestResponse);

      if (ingestResponse.ok) {
        setIngestResponse(ingestData.text);
      } else {
        console.error('Ingest API error:', ingestData.error);
      }
    } catch (error) {
      console.error('Ingest API error:', error);
    }
  };

  const fetchSummary = async (): Promise<void> => {
    try {
      const summaryResponse = await fetch('/api/summary');
      const summaryData = await summaryResponse.json();

      //debug
      console.log('summaryResponse:', summaryResponse);

      if (summaryResponse.ok) {
        setSummaryResponse(summaryData.text);
      } else {
        console.error('Summary API error:', summaryData.error);
      }
    } catch (error) {
      console.error('Summary API error:', error);
    }
  };

  const fetchAnalysis = async (): Promise<void> => {
    try {
      const analysisResponse = await fetch('/api/analysis');
      const analysisData = await analysisResponse.json();

      //debug
      console.log('analysisResponse:', analysisResponse);

      if (analysisResponse.ok) {
        setAnalysisResponse(analysisData.text);
      } else {
        console.error('Analysis API error:', analysisData.error);
      }
    } catch (error) {
      console.error('Analysis API error:', error);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (isUploaded) {
      alert('You can only upload once during this session');
      return;
    }

    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    setUploadStatus('Uploading file...');

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        setUploadStatus(data.message);

        // Append the uploaded file message to the messages state
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'userMessage',
              message: `Uploaded file: ${file.name}`,
            },
          ],
        }));
        setApiResponse(data.message);

        await fetchIngest();
        await fetchSummary();
        await fetchAnalysis();
      } else {
        const errorText = await response.text(); // Get the error response as text
        setUploadStatus(`File upload failed: ${errorText}`);
        console.log('Upload failed:', errorText);
      }
    } catch (error) {
      setUploadStatus(`An error occurred during file upload. Error: ${error}`);
      console.error('Upload error:', error);
    }
    setIsUploaded(true);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));

        setApiResponse(data.text); // Set the API response
      }

      setLoading(false);

      // Scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError(
        `An error occurred while fetching the data. Please try again. Error: ${error}`
      );
      console.log('error', error);
    }
  };

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  if (sessionEnded) {
    // Render a session ended message or redirect to a login page
    return <div>Session has ended. Please reload.</div>;
  }

  return (
    <>
      <div className="mx-auto flex flex-col gap-4">
        <main className={styles.main}>
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Text Digest
          </h1>
          <h2 className="text-lg font-semibold text-center mt-1">
            Reading with One-Click
          </h2>
          <br />
          <div className={styles.index_body}>
            <div className={styles.left}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              {uploadStatus && <p>{uploadStatus}</p>}
              <div>
                <h2>Summary:</h2>
                <textarea value={summaryResponse} readOnly></textarea>
              </div>
              <div>
                <h2>Analysis:</h2>
                <textarea value={analysisResponse} readOnly></textarea>
              </div>
            </div>
          <div className={styles.right}>
            <div>
              <h2>DigestBot</h2>
            </div>
            <div ref={messageListRef} className={styles.messagelist}>
              {messages.map((message, index) => {
                let className;
                if (message.type === "apiMessage") {
                  className = styles.apimessage;
                }
                return (
                  <>
                    <div key={`chatMessage-${index}`} className={className}>
                      <div className={styles.markdownanswer}>
                        <ReactMarkdown linkTarget="_blank">
                          {message.message}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {message.sourceDocs && (
                      <div
                        className="p-5"
                        key={`sourceDocsAccordion-${index}`}
                      >
                        <Accordion
                          type="single"
                          collapsible
                          className="flex-col"
                        >
                          <div className={styles.list}>
                            {message.sourceDocs.map((doc, index) => (
                              <div key={`messageSourceDocs-${index}`} >
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Source {index + 1}</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown linkTarget="_blank">
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2">
                                      <b>Source:</b> {doc.metadata.source}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            ))}
                          </div>
                        </Accordion>
                      </div>
                    )}
                  </>
                );
              })}
              </div>
              <div className={styles.arrow_region}>
                <textarea
                  ref={textAreaRef}
                  placeholder="What would you like to know about this document?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleEnter}
                ></textarea>
                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </button>
              </div>
            </div>
            </div>
          <br />
          <footer className="m-auto p-4">
            <span style={{ fontSize: "16px" }}>
              <p>
                Developed by:{" "}
                <a href="https://www.twitter.com/0error_eth">@0error_eth</a>{" "}
                with ❤️.
              </p>
            </span>
          </footer>
        </main>
      </div>
    </>
  );
}
