import { useEffect, useState, useCallback, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RelatedProducts from '../components/RelatedProducts';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ShopContext } from '../context/ShopContext';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUpload, FaTimes, FaExpand, FaHeart, FaShare, FaShoppingCart, FaBolt } from 'react-icons/fa';
import { BiImageAdd } from 'react-icons/bi';
import { MdVerified } from 'react-icons/md';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const {user} = useAuth();
  const [reviews, setReviews] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/products/${productId}`);
      if (response.data.success) {
        const product = response.data.data;
        setProductData(product);
        setImage(product.image[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const response = await axiosInstance.get(`/reviews/${productId}`);
      if (response.data.success) {
        const fetchedReviews = response.data.data.map(review => ({
          ...review,
          avatar: review.user.image,
          name: review.user.name,
          time: formatReviewTime(review.createdAt),
        }));
        setReviews(fetchedReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductData();
    fetchReviews();
  }, [fetchProductData, fetchReviews]);

  const formatReviewTime = (createdAt) => {
    const reviewDate = new Date(createdAt);
    const now = new Date();
    const timeDiffInSeconds = Math.floor((now - reviewDate) / 1000);
    
    if (timeDiffInSeconds < 60) {
      return 'Just now';
    } else if (timeDiffInSeconds < 3600) {
      const minutes = Math.floor(timeDiffInSeconds / 60);
      return `${minutes} minutes ago`;
    } else if (timeDiffInSeconds < 86400) {
      const hours = Math.floor(timeDiffInSeconds / 3600);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(timeDiffInSeconds / 86400);
      return `${days} days ago`;
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar 
            key={i} 
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} text-yellow-400`}
            onClick={() => interactive && onRatingChange && onRatingChange(i)}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar && !interactive) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(
          <FaRegStar 
            key={i} 
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} text-gray-300`}
            onClick={() => interactive && onRatingChange && onRatingChange(i)}
          />
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <p className="text-xl text-gray-600">Product not found</p>
          <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = (productData.price * quantity).toFixed(2);

  const handleAddToCart = async () => {
    if (!size) {
      toast.error('Please select a size before adding to cart.');
      return;
    }
    if (!user || !user.id) {
      toast.error('You must be logged in to add to cart.');
      return;
    }
    const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    if (!validSizes.includes(size)) {
      toast.error('Invalid size selected.');
      return;
    }
    if (typeof quantity !== 'number' || quantity < 1) {
      toast.error('Quantity must be at least 1.');
      return;
    }
    setAddingToCart(true);
    try {
      await axiosInstance.post(`/cart/${user.id}`, {
        productId: String(productId),
        size,
        quantity,
        price: productData.price,
        sellerId: productData.sellerId
      });
    setQuantity(1);
    toast.success("Product added to cart!");
    } catch (error) {
      toast.error("Failed to add product to cart.");
      console.error(error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (reviewImages.length + files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setReviewImages(prevImages => [...prevImages, ...newImages]);
  };

  const removeImage = (index) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
  };

  const submitReview = async () => {
    if (!reviewText.trim()) {
      toast.error('Please write a review before submitting.');
      return;
    }
    
    setSubmittingReview(true);
    const formData = new FormData();
    formData.append('rating', reviewRating);
    formData.append('comment', reviewText);
    formData.append('productId', productId);
    formData.append('userId', user?.id);

    try {
      const imageUrls = reviewImages.length > 0 ? await (async () => {
        const formData1 = new FormData();
        reviewImages.forEach(img => {
          formData1.append('files', img.file);
        });
        const uploadResponse = await axiosInstance.post('/upload/multiple', formData1, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return uploadResponse.data.data || [];
      })() : [];

      if (imageUrls.length === 1) {
        imageUrls.push('');
      }

      imageUrls.forEach(url => formData.append('images', url));
      const response = await axiosInstance.post('http://[::1]:3300/reviews', formData);
      const newReview = {
        ...response.data.data,
        avatar: response.data.data.user.image,
        name: response.data.data.user.name,
        time: formatReviewTime(response.data.data.createdAt),
      };

      setReviews([newReview, ...reviews]);
      setReviewText('');
      setReviewRating(5);
      setReviewImages([]);
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getReviewStats = () => {
    if (reviews.length === 0) return { average: 0, distribution: [0, 0, 0, 0, 0] };
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;
    
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    
    return { average, distribution };
  };

  const { average, distribution } = getReviewStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{productData.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative group">
                <img 
                  src={image} 
                  className="w-full h-96 lg:h-[500px] object-cover rounded-xl" 
                  alt={productData.name} 
                />
                <button 
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setEnlargedImage(image)}
                >
                  <FaExpand className="text-gray-600" />
                </button>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2">
            {productData.image.map((item, index) => (
              <img
                key={index}
                src={item}
                    alt={`${productData.name} ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 border-2 transition-all ${
                      item === image ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                onClick={() => setImage(item)}
              />
            ))}
          </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{productData.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {renderStars(productData.averageRating || 0)}
                    <span className="ml-2 text-lg font-semibold text-gray-700">
                      {(productData.averageRating || 0).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-500">({reviews.length} reviews)</span>
          </div>
        </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-blue-600">${productData.price}</span>
                {productData.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${productData.originalPrice}</span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">{productData.description}</p>

              {/* Size Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Select Size</h3>
                <div className="flex gap-2 flex-wrap">
              {productData.stockSize.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSize(item.size)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                        item.size === size 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                >
                  {item.size}
                </button>
              ))}
            </div>
          </div>

              {/* Quantity Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
              <button
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
              >
                -
              </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
              <button
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
                  </div>
                  <div className="text-lg">
                    Total: <span className="font-bold text-blue-600">${totalPrice}</span>
                  </div>
            </div>
          </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
            <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={handleAddToCart}
                  disabled={addingToCart || !size}
            >
                  <FaShoppingCart />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
                
                <Link 
                  to={`/check-out/${productId}?size=${size}&quantity=${quantity}`}
                  className="flex-1"
                >
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <FaBolt />
                    Buy Now
              </button>
            </Link>
                
                <button 
                  className={`p-3 border-2 rounded-lg transition-colors ${
                    isWishlisted ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-400'
                  }`}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <FaHeart className={isWishlisted ? 'fill-current' : ''} />
                </button>
                
                <button className="p-3 border-2 border-gray-300 text-gray-600 hover:border-gray-400 rounded-lg transition-colors">
                  <FaShare />
                </button>
          </div>

              {/* Product Features */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MdVerified className="text-green-500" />
                  100% Original product
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MdVerified className="text-green-500" />
                  Cash on delivery available
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MdVerified className="text-green-500" />
                  Easy return & exchange within 7 days
                </div>
          </div>

              {/* AI Try-On Button */}
            <button
              onClick={() => navigate(`/try-on/${productId}`)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
                Try on with AI ✨
            </button>
          </div>
        </div>
      </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b">
          <button
              className={`px-8 py-4 font-semibold transition-all ${
                activeTab === 'description' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
              className={`px-8 py-4 font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'review' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveTab('review');
                if (reviews.length === 0) fetchReviews();
              }}
            >
              Reviews
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {reviews.length}
              </span>
          </button>
        </div>

          <div className="p-8">
        {activeTab === 'description' ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{productData.description}</p>
          </div>
        ) : (
              <div className="space-y-8">
                {/* Review Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {average.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {renderStars(average)}
                    </div>
                    <p className="text-gray-600">Based on {reviews.length} reviews</p>
                  </div>
                  
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-8">{star}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: reviews.length > 0 ? `${(distribution[star - 1] / reviews.length) * 100}%` : '0%'
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {distribution[star - 1]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write Review Section */}
                {user && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Write a Review</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Rating
                        </label>
                        <div className="flex items-center gap-1">
                          {renderStars(reviewRating, true, setReviewRating)}
                          <span className="ml-2 text-lg font-semibold">({reviewRating}/5)</span>
              </div>
            </div>
            
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Review
                        </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your experience with this product..."
                          className="w-full border border-gray-300 rounded-lg p-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
                      </div>
                      
              <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Photos (Optional - Max 3)
                        </label>
                        <div className="flex gap-3">
                          {[0, 1, 2].map((index) => (
                            <div 
                              key={index} 
                              className="relative w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                            >
                              {reviewImages[index] ? (
                                <>
                                  <img
                                    src={reviewImages[index].preview}
                                    alt={`Review ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  <button
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    onClick={() => removeImage(index)}
                                  >
                                    <FaTimes className="text-xs" />
                                  </button>
                                </>
                              ) : (
                                <label className="w-full h-full flex items-center justify-center cursor-pointer">
                                  <BiImageAdd className="text-2xl text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                                </label>
                              )}
                    </div>
                  ))}
                </div>
              </div>
                      
                <button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center gap-2"
                  onClick={submitReview}
                        disabled={submittingReview || !reviewText.trim()}
                      >
                        {submittingReview ? (
                          <>
                            <Spinner />
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                </button>
              </div>
            </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {loadingReviews ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <FaStar className="text-6xl mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
                      <p className="text-gray-500">Be the first to share your experience!</p>
                    </div>
                  ) : (
                    <>
                      {reviews.slice((currentPage - 1) * 5, currentPage * 5).map((review) => (
                        <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {review.avatar && review.avatar !== "" ? (
                                <img 
                                  src={review.avatar} 
                                  alt={review.name} 
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" 
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {review.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                                  <p className="text-sm text-gray-500">{review.time}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              
                              <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                              
                              {review.images && review.images.length > 0 && (
                                <div className="flex gap-2">
                                  {review.images.map((img, index) => (
                                    img && img !== "" && (
                                      <img 
                                        key={index} 
                                        src={img} 
                                        alt={`Review ${index + 1}`} 
                                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform border border-gray-200" 
                                        onClick={() => setEnlargedImage(img)} 
                                      />
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Pagination */}
                      {Math.ceil(reviews.length / 5) > 1 && (
                        <div className="flex justify-center gap-2 pt-6">
                          {[...Array(Math.ceil(reviews.length / 5))].map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPage(index + 1)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === index + 1 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8">
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
        </div>
      </div>

      {/* Image Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img 
              src={enlargedImage} 
              alt="Enlarged view" 
              className="w-full h-full object-contain rounded-lg shadow-2xl" 
            />
            <button
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setEnlargedImage(null); }}
            >
              <FaTimes className="text-xl text-gray-800" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;