import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import UploadPhoto from '../components/UploadPhoto';
import '../styles/TryOn.css';

const TryOn = () => {
  const { productId } = useParams();
  const [image, setImage] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  const { products } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const foundProduct = products.find(item => item._id === productId);
      if (foundProduct) {
        setImage(foundProduct.image[0]);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [products, productId]);

  const handlePhotoUpload = (previewUrl) => {
    setUserPhoto(previewUrl); // Now directly using the preview URL
  };

  const handleGenerate = async () => {
    if (!userPhoto || !image) return;
    
    try {
      // Add your AI generation logic here
      console.log('Generating try-on image...');
    } catch (error) {
      console.error('Generation failed:', error);
    }
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
              {userPhoto && (
                <div className="preview-wrapper">
                  <img src={userPhoto} alt="Your uploaded photo" className="user-image" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="action-section">
          <button 
            className="generate-button"
            onClick={handleGenerate}
          >
            Try It On!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TryOn;
