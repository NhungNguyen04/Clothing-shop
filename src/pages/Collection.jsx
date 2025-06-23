import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import axiosInstance from '../api/axiosInstance';

function Collection() {
  const [products, setProducts] = useState([]);
  const [showFilter, setShowFilter] = useState(true);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [search, setSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  // New filter states for reviews and ratings
  const [minReviews, setMinReviews] = useState('');
  const [maxReviews, setMaxReviews] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');

  // Clear all filters function
  const clearAllFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setSearch('');
    setSellerSearch('');
    setMinReviews('');
    setMaxReviews('');
    setMinRating('');
    setMaxRating('');
    setSortType('relevant');
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/products`);
      setTotalPages(Math.ceil(response.data.data.length / limit));
      await handlePageChange(1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/products?page=${page}&limit=${limit}`);
      setProducts(response.data.data);
      setFilterProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) => 
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
    applyFilter();
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) => 
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
    applyFilter();
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    // Product name search
    if (search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Seller search
    if (sellerSearch) {
      productsCopy = productsCopy.filter((item) =>
        item.seller?.managerName?.toLowerCase().includes(sellerSearch.toLowerCase()) ||
        item.seller?.email?.toLowerCase().includes(sellerSearch.toLowerCase())
      );
    }

    // Category filter
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category.charAt(0).toUpperCase() + item.category.slice(1))
      );
    }

    // SubCategory filter
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory.charAt(0).toUpperCase() + item.subCategory.slice(1))
      );
    }

    // Reviews count filter
    if (minReviews) {
      productsCopy = productsCopy.filter((item) => item.reviews >= parseInt(minReviews));
    }
    if (maxReviews) {
      productsCopy = productsCopy.filter((item) => item.reviews <= parseInt(maxReviews));
    }

    // Rating filter
    if (minRating && !maxRating) {
      // If only minRating is set, filter from minRating to 5
      productsCopy = productsCopy.filter((item) => item.averageRating >= parseFloat(minRating) && item.averageRating <= 5);
    } else if (!minRating && maxRating) {
      // If only maxRating is set, filter from 0 to maxRating
      productsCopy = productsCopy.filter((item) => item.averageRating >= 0 && item.averageRating <= parseFloat(maxRating));
    } else if (minRating && maxRating) {
      // If both are set, filter within the range
      productsCopy = productsCopy.filter((item) => item.averageRating >= parseFloat(minRating) && item.averageRating <= parseFloat(maxRating));
    }

    setFilterProducts(productsCopy);
  };

  const sortProducts = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      case 'reviews-high':
        setFilterProducts(fpCopy.sort((a, b) => b.reviews - a.reviews));
        break;
      case 'reviews-low':
        setFilterProducts(fpCopy.sort((a, b) => a.reviews - b.reviews));
        break;
      case 'rating-high':
        setFilterProducts(fpCopy.sort((a, b) => b.averageRating - a.averageRating));
        break;
      case 'rating-low':
        setFilterProducts(fpCopy.sort((a, b) => a.averageRating - b.averageRating));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, sellerSearch, products, currentPage, minReviews, maxReviews, minRating, maxRating]);

  useEffect(() => {
    sortProducts();
  }, [sortType]);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {loading ? (
        <div className="absolute top-0 left-0 flex justify-center items-center h-screen w-full bg-white">
          <div className="flex flex-row gap-2">
            <div className="w-4 h-4 rounded-full bg-black animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-black animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-black animate-bounce [animation-delay:-.5s]"></div>
          </div>
        </div>
      ) : (
        <>
          <div className='min-w-60'>
            <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
              <img src={assets.dropdown_icon} className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} alt="" />
            </p>
            
            {/* Clear Filters Button */}
            <div className={`${showFilter ? '' : 'hidden'} sm:block mb-3`}>
              <button 
                onClick={clearAllFilters}
                className='w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded text-sm font-medium transition-colors'
              >
                Clear All Filters
              </button>
            </div>
            
            {/* Search Section */}
            <div className={`border border-gray-300 p-4 rounded-md mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
              <p className='mb-3 text-base font-semibold'>SEARCH</p>
              <div className='flex flex-col gap-4 text-sm'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Product Name</label>
                  <input 
                    type="text" 
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Seller</label>
                  <input 
                    type="text" 
                    placeholder="Search by seller..."
                    value={sellerSearch}
                    onChange={(e) => setSellerSearch(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition'
                  />
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className={`border border-gray-300 p-4 rounded-md mt-5 ${showFilter ? '' : 'hidden'} sm:block`}>
              <p className='mb-3 text-base font-semibold'>CATEGORIES</p>
              <div className='flex flex-col gap-3 text-sm text-gray-700'>
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input type="checkbox" onChange={toggleCategory} className='h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500' value={'Men'} />Men
                </label>
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input type="checkbox" onChange={toggleCategory} className='h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500' value={'Women'} />Women
                </label>
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input type="checkbox" onChange={toggleCategory} className='h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500' value={'Kids'} />Kids
                </label>
              </div>
            </div>

            {/* Type Section */}
            <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
              <p className='mb-3 text-sm font-medium'>TYPE</p>
              <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' onChange={toggleSubCategory} value={'Topwear'} />Topwear
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' onChange={toggleSubCategory} value={'Bottomwear'} />Bottomwear
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' onChange={toggleSubCategory} value={'Winterwear'} />Winterwear
                </p>
              </div>
            </div>

            {/* Reviews Count Section */}
            <div className={`border border-gray-300 p-4 rounded-md my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
              <p className='mb-3 text-base font-semibold'>REVIEWS COUNT</p>
              <div className='flex items-center gap-2 text-sm'>
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minReviews}
                  onChange={(e) => setMinReviews(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition'
                />
                <span className='text-gray-500'>to</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxReviews}
                  onChange={(e) => setMaxReviews(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition'
                />
              </div>
            </div>

            {/* Average Rating Section */}
            <div className={`border border-gray-300 p-4 rounded-md my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
              <p className='mb-3 text-base font-semibold'>AVERAGE RATING</p>
              <div className='flex items-center gap-2 text-sm'>
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  min="0"
                  max="5"
                  step="0.1"
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition'
                />
                <span className='text-gray-500'>to</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxRating}
                  onChange={(e) => setMaxRating(e.target.value)}
                  min="0"
                  max="5"
                  step="0.1"
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition'
                />
              </div>
            </div>

            {/* Price Section */}
            <div className={`border border-gray-300 pl-5 py-3 ${showFilter ? '' : 'hidden'} sm:block`}>
              <p className='mb-3 text-sm font-medium'>PRICE</p>
              <div className='flex flex-col gap-2 text-sm'>
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>Min Price</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className='w-full px-2 py-1 border border-gray-300 rounded text-xs'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>Max Price</label>
                  <input 
                    type="number" 
                    placeholder="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className='w-full px-2 py-1 border border-gray-300 rounded text-xs'
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='flex-1'>
            <div className='flex justify-between text-base sm:text-2xl mb-4'>
              <Title text1={'ALL'} text2={'COLLECTIONS'} />
              <select onChange={(e) => setSortType(e.target.value)} className='border-2 bg-white border-gray-300 text-sm px-2 py-1' id="">
                <option value="relevant">Sort by: Relevant</option>
                <option value="low-high">Sort by: Price Low to High</option>
                <option value="high-low">Sort by: Price High to Low</option>
                <option value="reviews-high">Sort by: Reviews High to Low</option>
                <option value="reviews-low">Sort by: Reviews Low to High</option>
                <option value="rating-high">Sort by: Rating High to Low</option>
                <option value="rating-low">Sort by: Rating Low to High</option>
              </select>
            </div>

            {/* Results Counter */}
            <div className='mb-4 text-sm text-gray-600'>
              Showing {filterProducts.length} of {products.length} products
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
              {
                filterProducts.map((item, index) => (
                  <ProductItem
                    key={index}
                    name={item.name}
                    id={item.id}
                    price={item.price}
                    image={item.image}
                    averageRating={item.averageRating}
                    reviews={item.reviews}
                  />
                ))
              }
            </div>

            {/* Pagination Buttons */}
            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentPage(index + 1);
                    handlePageChange(index + 1);
                  }}
                  className={`px-3 py-1 border ${currentPage === index + 1 ? 'bg-pink-500 text-white' : 'text-gray-700'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Collection;
