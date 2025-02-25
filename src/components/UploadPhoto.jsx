import React, { useState } from 'react';

const UploadPhoto = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      // Replace with your actual upload API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        onUpload && onUpload(data);
        setSelectedFile(null);
        setPreview(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="upload-photo-container">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="file-input"
      />
      {preview && (
        <div className="preview-container">
          <img src={preview} alt="Preview" className="image-preview" />
          <button onClick={handleUpload} className="upload-button">
            Upload Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPhoto;
