import { useState, useEffect, useCallback } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import axiosInstance from '../api/axiosInstance';

const BestSeller = () => {
  const [bestSeller, setBestSeller] = useState([]);

  const fetchBestSellers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/products');
      const bestProducts = response.data.data
      const shuffled = bestProducts.sort(() => 0.5 - Math.random());
      setBestSeller(shuffled.slice(0, 5));
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    }
  }, []);

  useEffect(() => {
    fetchBestSellers();
  }, [fetchBestSellers]);
  
  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLERS'}/>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
          bestSeller.map((product) => (
            <ProductItem
              key={product.id}
              id={product.id}
              image={product.image}
              name={product.name}
              price={product.price}
            />
          ))
        }
      </div>
    </div>
  );
};

export default BestSeller;
