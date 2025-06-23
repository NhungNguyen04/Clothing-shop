import { useContext } from 'react'
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import PropTypes from 'prop-types';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const ProductItem = ({id, image, name, price, averageRating = 0, reviews = 0}) => {

  const { currency } = useContext(ShopContext);

  const renderStars = (rating) => {
    if (rating < 0 || rating > 5) {
      console.warn('Rating should be between 0 and 5');
      return null;
    }

    if (rating === 0) {
      return null;
    }
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400 inline-block text-xs" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 inline-block text-xs" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300 inline-block text-xs" />);
      }
    }
    return stars;
  };

  return (
    <Link to={`/product/${id}`} className='text-gray-700 cursor-pointer block'>
      <div className='overflow-hidden h-80 bg-gray-100'>
        <img className="hover:scale-110 transition ease-in-out h-full w-full object-cover" src={image[0]} alt={name} />
      </div>
      <p className='pt-3 pb-1 text-sm font-medium truncate'>{name}</p>
      <p className='text-sm font-bold'>{currency}{price}</p>
      <div className='flex items-center gap-2 mt-1'>
        <div className='flex'>{renderStars(averageRating)}</div>
        {reviews > 0 && (<span className='text-xs text-gray-500'>({reviews})</span>)}
      </div>
    </Link>
  )
}

ProductItem.propTypes = {
  id: PropTypes.string.isRequired,
  image: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  averageRating: PropTypes.number,
  reviews: PropTypes.number,
};


export default ProductItem
