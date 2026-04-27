import React, { useRef, useState } from 'react';
import { uploadFileWithHash } from '../utils/fileUpload';
import './FileUpload.css';

const FileUpload = ({ onFileUpload, disabled = false }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadFileWithHash(selectedFile, (state) => {
        setProgress(state.progress);
      });

      // Call parent callback with upload result
      if (onFileUpload) {
        onFileUpload({
          fileName: selectedFile.name,
          fileSize: selectedFile.name,
          ipfsCID: result.ipfsCID,
          fileHash: result.fileHash,
          uploadedAt: new Date(),
        });
      }

      // Reset form
      setSelectedFile(null);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-box">
        <h3>Upload Contribution File</h3>

        {error && <div className="error-message">{error}</div>}

        <div className="file-input-wrapper">
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            disabled={uploading || disabled}
            className="file-input"
          />
          <label htmlFor="file-input" className="file-input-label">
            {selectedFile ? selectedFile.name : 'Choose a file...'}
          </label>
        </div>

        {selectedFile && (
          <div className="file-info">
            <p>
              <strong>File:</strong> {selectedFile.name}
            </p>
            <p>
              <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {uploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}>
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        )}

        <div className="button-group">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || disabled}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload to IPFS'}
          </button>
          <button
            onClick={handleCancel}
            disabled={!selectedFile || uploading || disabled}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
