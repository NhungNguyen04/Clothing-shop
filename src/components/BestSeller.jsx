import { useState, useEffect } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import { useProductStore } from '../store/ProductStore';

const BestSeller = () => {
  const { products, isLoading, fetchProducts } = useProductStore();
  const [bestSeller, setBestSeller] = useState([]);
  
  useEffect(() => {
    // Fetch products if not already loaded
    if (!products) {
      fetchProducts();
    }
  }, [products, fetchProducts]);
  
  useEffect(() => {
    if (products && products.length > 0) {
      // Sort by highest average rating for best sellers
      const topRated = [...products]
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);
      setBestSeller(topRated);
    }
  }, [products]);
  
  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLERS'}/>
      </div>      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {isLoading ? (
          <div className="col-span-full text-center">Loading best sellers...</div>
        ) : bestSeller && bestSeller.length > 0 ? (
          bestSeller.map((product) => (
            <ProductItem
              key={product.id}
              id={product.id}
              image={product.image}
              name={product.name}
              price={product.price}
              averageRating={product.averageRating}
              reviews={product.reviews}
            />
          ))
        ) : (
          <div className="col-span-full text-center">No products found</div>
        )}
      </div>
    </div>
  );
};

export default BestSeller;
