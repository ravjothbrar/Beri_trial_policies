import React, { useState } from 'react';

export default function PDFUploader({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();

      setUploadedFiles(prev => [...prev, {
        name: file.name,
        chunks: result.chunks_created,
        timestamp: new Date().toLocaleTimeString()
      }]);

      if (onUploadComplete) {
        onUploadComplete(result);
      }

      // Reset file input
      event.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleClearData = async () => {
    try {
      const response = await fetch('http://localhost:8000/clear', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear data');
      }

      setUploadedFiles([]);
      setError(null);
    } catch (err) {
      console.error('Clear error:', err);
      setError('Failed to clear data');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">Upload Policy Documents</h2>
        {uploadedFiles.length > 0 && (
          <button
            onClick={handleClearData}
            className="text-sm text-error hover:text-red-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div className="mb-4">
        <label
          htmlFor="pdf-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF documents only</p>
          </div>
          <input
            id="pdf-upload"
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Processing PDF...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-error text-error px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-text">Uploaded Documents:</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-error"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-text">{file.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-textMuted">
                  <span>{file.chunks} chunks</span>
                  <span>{file.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
