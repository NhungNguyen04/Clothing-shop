import { useState, useEffect, useCallback } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import axiosInstance from '../api/axiosInstance';

const LatestCollection = () => {
  const [latestProducts, setLatestProducts] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/products');
      setLatestProducts(response.data.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTION'}></Title>
      </div>

      {/* Rendering products */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
          latestProducts.map((item) => (
            <ProductItem 
              key={item.id} 
              id={item.id} 
              image={item.image} 
              name={item.name} 
              price={item.price}
              averageRating={item.averageRating}
              reviews={item.reviews}
            />
          ))
        }
      </div>
    </div>
  );
};

export default LatestCollection;
