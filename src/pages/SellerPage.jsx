import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaComment, FaArrowLeft } from 'react-icons/fa';
import { getSellerById } from '../services/seller';
import { createConversation } from '../services/chat';
import ProductItem from '../components/ProductItem';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

const SellerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState({
    min: '',
    max: ''
  });

  // Load seller data
  const loadSellerData = useCallback(async () => {
    if (!id) {
      setError('No seller ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch seller information
      const sellerResponse = await getSellerById(id);
      
      // Check if response has the seller data
      if (sellerResponse?.data?.seller) {
        const sellerData = sellerResponse.data.seller;
        setSeller(sellerData);
        
        // Set products from seller data
        if (sellerData.products && sellerData.products.length > 0) {
          setProducts(sellerData.products);
          setFilteredProducts(sellerData.products);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      }
      // If seller data is directly in the response
      else if (sellerResponse?.seller) {
        const sellerData = sellerResponse.seller;
        setSeller(sellerData);
        
        if (sellerData.products && sellerData.products.length > 0) {
          setProducts(sellerData.products);
          setFilteredProducts(sellerData.products);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      }
      // Handle case where the API returns an object with no seller property
      else {
        setError('Seller information not available in API response');
      }
    } catch (err) {
      console.error('Error loading seller data:', err);
      setError(err.message || 'Failed to load seller information');
      toast.error('Failed to load seller information');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  // Handle product filtering
  useEffect(() => {
    if (!products.length) return;

    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price
    if (priceFilter.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceFilter.min));
    }
    if (priceFilter.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceFilter.max));
    }

    setFilteredProducts(filtered);
  }, [searchTerm, priceFilter, products]);

  // Handle chat with seller
  const handleChatWithSeller = async () => {
    if (!user || !seller) {
      toast.error("You must be logged in to chat with the seller");
      return;
    }
    
    try {
      // Create a new conversation or get existing one
      const conversation = await createConversation(user.id, seller.id);
      
      // Navigate to chat page with conversation ID
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Error starting chat with seller:', error);
      toast.error('Could not start chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading seller information...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-5">{error || 'Seller not found'}</p>
          {products.length > 0 && (
            <p className="text-sm text-gray-500 mb-5">
              Found {products.length} products, but seller information is unavailable
            </p>
          )}
          <Link to="/" className="text-pink-600 text-lg font-medium">Go Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 text-pink-600 flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      
      {/* Seller Profile */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <img 
              src={seller.image || 'https://via.placeholder.com/150'} 
              alt={seller.managerName} 
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
          </div>
          
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{seller.managerName}</h1>
            <p className="text-gray-600 mb-4">Seller since {new Date(seller.createdAt).getFullYear()}</p>
            
            {/* Contact Information */}
            <div className="space-y-2">
              {seller.address?.phoneNumber && (
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2 text-gray-500" />
                  <span>{seller.address.phoneNumber}</span>
                </div>
              )}
              
              {seller.email && (
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-2 text-gray-500" />
                  <span>{seller.email}</span>
                </div>
              )}
              
              {seller.address && (
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-gray-500" />
                  <span>
                    {seller.address.address}
                    {seller.address.postalCode ? `, ${seller.address.postalCode}` : ''}
                  </span>
                </div>
              )}
            </div>
            
            {/* Chat Button */}
            <button 
              onClick={handleChatWithSeller}
              className="mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded flex items-center transition-colors"
            >
              <FaComment className="mr-2" />
              Chat with Seller
            </button>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Products by {seller.managerName}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          
          {/* Price Filter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                id="min-price"
                value={priceFilter.min}
                onChange={(e) => setPriceFilter({...priceFilter, min: e.target.value})}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                id="max-price"
                value={priceFilter.max}
                onChange={(e) => setPriceFilter({...priceFilter, max: e.target.value})}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>
        
        {/* Reset Filters Button */}
        {(searchTerm || priceFilter.min || priceFilter.max) && (
          <button 
            onClick={() => {
              setSearchTerm('');
              setPriceFilter({ min: '', max: '' });
            }}
            className="mt-4 text-pink-600 text-sm underline"
          >
            Reset Filters
          </button>
        )}
      </div>
      
      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredProducts.map(product => (
            <ProductItem 
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              averageRating={product.averageRating }
              reviews={product.reviews}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
};

export default SellerPage;
