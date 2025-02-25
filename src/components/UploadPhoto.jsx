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
        onUpload && onUpload(reader.result); // Pass preview URL immediately
      };
      reader.readAsDataURL(file);
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
        </div>
      )}
    </div>
  );
};

export default UploadPhoto;
