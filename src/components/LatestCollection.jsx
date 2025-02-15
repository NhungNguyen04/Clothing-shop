import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {

  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]); // Fixed useState destructuring

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, []); // Added dependency array to prevent infinite loop
  
  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTION'}></Title>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec massa auctor.
        </p>
      </div>

    {/* Rendering products */}
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
      {
        latestProducts.map((items, index) => (  // Added parentheses for implicit return
          <ProductItem 
            key={index} 
            id={items._id} 
            image={items.image} 
            name={items.name} 
            price={items.price}
          />
        ))
      }
    </div>

    </div>
  )
}

export default LatestCollection
