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
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

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

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category.charAt(0).toUpperCase() + item.category.slice(1))
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory.charAt(0).toUpperCase() + item.subCategory.slice(1))
      );
    } 
    setFilterProducts(productsCopy)
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
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products, currentPage]);

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
            <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
              <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
              <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                <p className='flex gap-2'>
                  <input type="checkbox" onChange={toggleCategory} className='w-3' value={'Men'} />Men
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" onChange={toggleCategory} className='w-3' value={'Women'} />Women
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" onChange={toggleCategory} className='w-3' value={'Kids'} />Kids
                </p>
              </div>
            </div>
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
          </div>

          <div className='flex-1'>
            <div className='flex justify-between text-base sm:text-2xl mb-4'>
              <Title text1={'ALL'} text2={'COLLECTIONS'} />
              <select onChange={(e) => setSortType(e.target.value)} className='border-2 bg-white border-gray-300 text-sm px-2 py-1' id="">
                <option value="relevant">Sort by: Relevant</option>
                <option value="low-high">Sort by: Low to High</option>
                <option value="high-low">Sort by: High to Low</option>
              </select>
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
