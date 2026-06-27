import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UploadPhoto from '../components/UploadPhoto';
import '../styles/TryOn.css';
import { generateTryOnImage, uploadTryOnImage } from '../services/tryOn';
import { fetchProductById } from '../services/product';

const TryOn = () => {
  const { productId } = useParams();
  const [image, setImage] = useState('');
  const [userPhotoPreview, setUserPhotoPreview] = useState(null);
  const [userPhotoFile, setUserPhotoFile] = useState(null);
  const [personImageUrl, setPersonImageUrl] = useState('');
  const [photoHistory, setPhotoHistory] = useState([]);
  const [selectedHistoryUrl, setSelectedHistoryUrl] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const historyStorageKey = 'tryOnPhotoHistory';

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const product = await fetchProductById(productId);
      if (!product) {
        setError('Product not found');
        return;
      }
      setImage(product.image?.[0] || '');
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(historyStorageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        setPhotoHistory(parsed.filter((url) => typeof url === 'string' && url.trim() !== ''));
      }
    } catch (err) {
      setPhotoHistory([]);
    }
  }, []);

  const handlePhotoUpload = ({ file, previewUrl }) => {
    setUserPhotoFile(file);
    setUserPhotoPreview(previewUrl);
    setPersonImageUrl('');
    setSelectedHistoryUrl('');
    setGeneratedImage(null);
  };

  const handleHistorySelect = (url) => {
    setUserPhotoFile(null);
    setPersonImageUrl(url);
    setUserPhotoPreview(url);
    setSelectedHistoryUrl(url);
    setGeneratedImage(null);
  };

  const addPhotoToHistory = (url) => {
    setPhotoHistory((prev) => {
      const next = [url, ...prev.filter((item) => item !== url)].slice(0, 6);
      localStorage.setItem(historyStorageKey, JSON.stringify(next));
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!image) {
      setError('Please select a product.');
      return;
    }

    if (!userPhotoFile && !personImageUrl) {
      setError('Please upload a photo or select a previous upload.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      let resolvedPersonUrl = personImageUrl;
      if (userPhotoFile) {
        resolvedPersonUrl = await uploadTryOnImage(userPhotoFile);
        addPhotoToHistory(resolvedPersonUrl);
        setPersonImageUrl(resolvedPersonUrl);
      }

      const resultUrl = await generateTryOnImage({
        personImageUrl: resolvedPersonUrl,
        productImageUrl: image,
      });

      setGeneratedImage(resultUrl);
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Try-on generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const availableImages = [
    'https://nh-clothing.s3.ap-southeast-2.amazonaws.com/1782579865544-a949e58edb214357f46ad70186cbcda2.jpg',
    'https://nh-clothing.s3.ap-southeast-2.amazonaws.com/1782580022584-a75600a7b5978e53f6570f7f0478f755.jpg',
    'https://nh-clothing.s3.ap-southeast-2.amazonaws.com/1782580208172-4a56553b1aa7187d22e2957fcc7e82b3.jpg',
  ];

  const handleAvailableImageSelect = (url) => {
    setUserPhotoFile(null);
    setPersonImageUrl(url);
    setUserPhotoPreview(url);
    setSelectedHistoryUrl(url);
    setGeneratedImage(null);
    setError(null);
  };

  if (loading) return <div className="try-on-container">Loading...</div>;
  if (error) return <div className="try-on-container error">{error}</div>;

  return (
    <div className="try-on-wrapper">
      <h2 className="try-on-title">Virtual Try-On</h2>
      <div className="try-on-container">
        <div className="try-on-grid">
          <div className="image-section">
            <h3>Selected Product</h3>
            <div className="image-wrapper">
              {image && <img src={image} alt="Product" className="product-image" />}
            </div>
          </div>
          
          <div className="image-section">
            <h3>Your Photo</h3>
            <div className="upload-wrapper">
              <UploadPhoto onUpload={handlePhotoUpload} />
              <div className="history-section">
                <p className="history-title">Or choose an available image</p>

                <div className="history-grid">
                  {availableImages.map((url) => (
                    <button
                      key={url}
                      type="button"
                      className={`history-button ${personImageUrl === url ? 'is-selected' : ''}`}
                      onClick={() => handleAvailableImageSelect(url)}
                    >
                      <img src={url} alt="Available option" className="history-image" />
                    </button>
                  ))}
                </div>
              </div>
              {userPhotoPreview && (
                <div className="preview-wrapper">
                  <img src={userPhotoPreview} alt="Your uploaded photo" className="user-image" />
                </div>
              )}
              {photoHistory.length > 0 && (
                <div className="history-section">
                  <p className="history-title">Or pick a previous upload</p>
                  <div className="history-grid">
                    {photoHistory.map((url) => (
                      <button
                        key={url}
                        type="button"
                        className={`history-button ${selectedHistoryUrl === url ? 'is-selected' : ''}`}
                        onClick={() => handleHistorySelect(url)}
                      >
                        <img src={url} alt="Previous upload" className="history-image" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {generatedImage && (
          <div className="generated-section">
            <h3>Try-On Result</h3>
            <div className="image-wrapper">
              <img src={generatedImage} alt="Try-on result" className="product-image" />
            </div>
          </div>
        )}

        <div className="action-section">
          <button 
            className="generate-button"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Try It On!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TryOn;
