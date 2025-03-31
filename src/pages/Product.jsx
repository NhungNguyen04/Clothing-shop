import { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RelatedProducts from '../components/RelatedProducts';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ShopContext } from '../context/ShopContext';

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(ShopContext); // Use ShopContext
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch product data
  const fetchProductData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/products/${productId}`);
      if (response.data.success) {
        const product = response.data.data;
        setProductData(product);
        setImage(product.image[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  if (!productData) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const totalPrice = (productData.price * quantity).toFixed(2);

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!size) {
      toast.error('Please select a size before adding to cart.');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(productId, size, productData.price);
    }
    setQuantity(1)
    toast.success("Product added to cart!");
  };

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                key={index}
                src={item}
                alt={productData.name}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                onClick={() => setImage(item)}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img src={image} className="w-full h-auto" alt={productData.name} />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl">{productData.name}</h1>
          <p className="mt-5 text-3xl font-medium ">${productData.price}</p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>

          {/* Select Size */}
          <div className="flex flex-col gap-4 my-8">
            <p>Select size</p>
            <div className="flex gap-2">
              {productData.stockSize.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSize(item.size)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item.size === size ? 'border-orange-500' : ''
                  }`}
                >
                  {item.size}
                </button>
              ))}
            </div>
          </div>

          {/* Select Quantity */}
          <div className="flex items-center gap-4 my-4 text-xl">
            <p>Quantity</p>
            <div className="flex items-center border px-3 py-2 bg-gray-100">
              <button
                className="px-3 text-lg"
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
              >
                -
              </button>
              <span className="mx-4">{quantity}</span>
              <button
                className="px-3 text-lg"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Total Price */}
          <p className="text-xl mt-2">Total Price: <span className="text-red-400 font-bold">${totalPrice}</span></p>

          <div className="flex gap-4 mt-4">
            <button
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
              onClick={handleAddToCart}
            >
              ADD TO CART
            </button>
            <button className="bg-orange-500 text-white px-8 py-3 text-sm active:bg-orange-700">
              BUY NOW
            </button>
          </div>
          
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>

          {/* Try-on Button */}
          <div className="mt-20">
            <button
              onClick={() => navigate(`/try-on/${productId}`)}
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
            >
              Try on with AI
            </button>
          </div>
        </div>
      </div>

      {/* Description & Review Section */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Review (122)</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>{productData.description}</p>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
};

export default Product;
