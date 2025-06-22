import Title from './Title';
import ProductItem from './ProductItem';
import { useProductStore } from '../store/ProductStore';

const LatestCollection = () => {
  const { recentProducts, isLoading } = useProductStore();
  
  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTION'}></Title>
      </div>      {/* Rendering products */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {isLoading ? (
          <div className="col-span-full text-center">Loading latest products...</div>
        ) : recentProducts && recentProducts.length > 0 ? (
          recentProducts.map((item) => (
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
        ) : (
          <div className="col-span-full text-center">No products found</div>
        )}
      </div>
    </div>
  );
};

export default LatestCollection;
