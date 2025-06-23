import React, { useEffect, useState } from 'react'
import { useProductStore } from '../store/ProductStore'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({category, subCategory}) => {

  const { products, fetchProducts } = useProductStore();
  const [ related, setRelated ] = useState([]);

  useEffect(() => {
    // Fetch products if not already loaded
    if (!products) {
      fetchProducts();
    }
  }, [products, fetchProducts]);

  useEffect(() => {
    if (products && products.length > 0) {
      let productsCopy = products.slice();

      productsCopy = productsCopy.filter(item => item.category === category)
      productsCopy = productsCopy.filter(item => item.subCategory === subCategory)

      setRelated(productsCopy.slice(0, 5));
    }
  }, [products, category, subCategory])

  return (
    <div className='my-24'>
      <div className='text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={'PRODUCTS'}/>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
          related.map((item, index) => (
            <ProductItem
              key = {index}
              id = {item.id}
              name={item.name}
              price={item.price}
              image={item.image}
              averageRating={item.averageRating}
              reviews={item.reviews}
            />
          ))
        }
      </div>
    </div>
  )
}

export default RelatedProducts
