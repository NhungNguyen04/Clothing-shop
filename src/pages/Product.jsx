import { useEffect, useState, useCallback, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RelatedProducts from '../components/RelatedProducts';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ShopContext } from '../context/ShopContext';
import { FaStar } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

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
  const [reviewImages, setReviewImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = useAuth();
  const [reviews, setReviews] = useState([]);

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
      return `${minutes} phút trước`;
    } else {
      const hours = Math.floor(timeDiffInSeconds / 3600);
      return `${hours} tiếng trước`;
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!productData) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const totalPrice = (productData.price * quantity).toFixed(2);

  const handleAddToCart = () => {
    if (!size) {
      toast.error('Please select a size before adding to cart.');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(productId, size, productData.price, productData.sellerId);
    }
    setQuantity(1);
    toast.success("Product added to cart!");
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
    const formData = new FormData();
    formData.append('rating', 5);
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

      setReviews([...reviews, newReview]);
      setReviewText('');
      setReviewImages([]);
      if (reviews.length >= 4) {
        setCurrentPage(Math.ceil((reviews.length + 1) / 5));
      }
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review.');
    }
  };

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                key={index}
                src={item}
                alt={productData.name}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                onClick={() => setImage(item)}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img src={image} className="w-full h-auto" alt={productData.name} />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="font-medium text-2xl">{productData.name}</h1>
          <p className="mt-5 text-3xl font-medium ">${productData.price}</p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>

          <div className="flex flex-col gap-4 my-8">
            <p>Select size</p>
            <div className="flex gap-2">
              {productData.stockSize.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSize(item.size)}
                  className={`border py-2 px-4 bg-gray-100 ${item.size === size ? 'border-orange-500' : ''}`}
                >
                  {item.size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 my-4 text-xl">
            <p>Quantity</p>
            <div className="flex items-center border px-3 py-2 bg-gray-100">
              <button
                className="px-3 text-lg"
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
              >
                -
              </button>
              <span className="mx-4">{quantity}</span>
              <button
                className="px-3 text-lg"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>
          </div>

          <p className="text-xl mt-2">Total Price: <span className="text-red-400 font-bold">${totalPrice}</span></p>

          <div className="flex gap-4 mt-4">
            <button
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
              onClick={handleAddToCart}
            >
              ADD TO CART
            </button>
            <Link to={`/check-out/${productId}?size=${size}&quantity=${quantity}`}>
              <button className="bg-orange-500 text-white px-8 py-3 text-sm active:bg-orange-700">
                BUY NOW
              </button>
            </Link>
          </div>

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>

          <div className="mt-20">
            <button
              onClick={() => navigate(`/try-on/${productId}`)}
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
            >
              Try on with AI
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="flex">
          <button
            className={`border px-5 py-3 text-sm ${activeTab === 'description' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`border px-5 py-3 text-sm ${activeTab === 'review' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            Review
          </button>
        </div>
        {activeTab === 'description' ? (
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>{productData.description}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            {reviews.slice((currentPage - 1) * 5, currentPage * 5).map((review) => (
              <div key={review.id} className="flex items-start gap-4 border-b py-4">
                {review.avatar && review.avatar !== "" ? <img src={review.avatar} alt={review.name} className="rounded-full w-12 h-12" /> : ""}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-semibold">{review.name}</div>
                    <div className="text-gray-500 text-sm">{review.time}</div>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <FaStar key={index} className={`text-yellow-500 ${index < review.rating ? 'filled' : ''}`} />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((img, index) => (
                        img !== "" && <img key={index} src={img} alt={`Review ${index + 1}`} className="w-12 h-12 object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-center gap-2">
              {[...Array(Math.ceil(reviews.length / 5))].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 border ${currentPage === index + 1 ? 'bg-gray-200' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col gap-4">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
                className="border p-2 w-full"
              />
              <div>
                <div className="flex gap-2 mt-2">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className="relative">
                      <img
                        src={reviewImages[index] ? reviewImages[index].preview : "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="}
                        alt={`No Image ${index + 1}`}
                        className="w-12 h-12 object-cover cursor-pointer"
                        onClick={() => document.getElementById(`file-input-${index}`).click()}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        id={`file-input-${index}`}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum 3 images allowed</p>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-black text-white px-4 py-2"
                  onClick={submitReview}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
};

export default Product;
