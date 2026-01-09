import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import ChatContainer from './components/ChatContainer';
import InputArea from './components/InputArea';
import PDFUploader from './components/PDFUploader';
import { initBERI, askBERI, checkBrowserSupport, uploadPDF } from './lib/beri';

function App() {
  const [status, setStatus] = useState('loading'); // loading, ready, error
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStage, setLoadStage] = useState('Checking browser support...');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check browser support
      const support = await checkBrowserSupport();

      if (!support.webgpu || !support.indexeddb) {
        setError(support.reason);
        setStatus('error');
        setLoadStage(`Error: ${support.reason}`);
        return;
      }

      // Initialize BERI (browser-based)
      await initBERI((progress) => {
        setLoadProgress(progress.progress);
        setLoadStage(progress.stage);
      });

      setStatus('ready');
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err.message);
      setStatus('error');
      setLoadStage(`Error: ${err.message}`);
    }
  };

  const handleSubmit = async (query) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // Prepare assistant message
    let assistantContent = '';
    let assistantSources = [];

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      sources: [],
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Query BERI with streaming
      await askBERI(
        query,
        (token) => {
          // Stream tokens
          assistantContent += token;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: assistantContent
            };
            return updated;
          });
        }
      ).then((result) => {
        // Add sources when complete
        assistantSources = result.sources;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            sources: assistantSources
          };
          return updated;
        });
      });
    } catch (err) {
      console.error('Error asking BERI:', err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: `Sorry, I encountered an error: ${err.message}. Please try again.`
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  if (status === 'loading') {
    return <LoadingScreen progress={loadProgress} stage={loadStage} />;
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-md w-full px-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-error mb-2">
              Initialization Error
            </h1>
            <p className="text-textMuted mb-4">{error}</p>
            <p className="text-sm text-textMuted">
              Please ensure you are using Chrome 113+ or Edge 113+ with WebGPU enabled.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePDFUpload = async (file) => {
    try {
      const result = await uploadPDF(file, (progress) => {
        console.log('Upload progress:', progress);
      });
      console.log('Upload complete:', result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header status={status} />
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-6">
          <PDFUploader onUpload={handlePDFUpload} />
          <ChatContainer messages={messages} isStreaming={isStreaming} />
        </div>
      </div>
      <InputArea
        onSubmit={handleSubmit}
        disabled={status !== 'ready'}
        isStreaming={isStreaming}
      />
    </div>
  );
}

export default App;
