import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoTrash } from "react-icons/go";
import { FaPlus, FaMinus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import { ShopContext } from "../context/ShopContext";
import useAuth from '../hooks/useAuth';
import Spinner from '../components/Spinner';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const shippingFee = 10;
  const { cartTotal, setCartTotal } = useContext(ShopContext);
  const { user } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);
  const [cartId, setCartId] = useState("");

  useEffect(() => {
    if (!user || !user.id) return;
    setLoading(true);
    const fetchCart = async () => {
      try {
        const response = await axiosInstance.get(`/cart/${user.id}`);
        setCart(response.data.cartItems || []);
        setCartId(response.data.id || "");
        const subtotal = (response.data.cartItems || []).reduce((sum, item) => sum + (Number(item.totalPrice)), 0);
        setCartTotal(subtotal);
      } catch (error) {
        setCart([]);
        setCartId("");
        setCartTotal(0);
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user, setCartTotal]);

  const updateLocalStorage = (updatedCart) => {
    console.log(updatedCart)
    const cartData = {};
    updatedCart.forEach(({ id, size, quantity, price, sellerId }) => {
      if (!cartData[id]) cartData[id] = {};
      cartData[id] = {size, quantity, price, sellerId};
      setCartTotal(price * quantity)
    });
    localStorage.setItem("cartItems", JSON.stringify(cartData));
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingId(cartItemId);
    try {
      await axiosInstance.patch(`/cart/item/${cartItemId}`, { quantity: newQuantity });
      setCart((prev) => prev.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity, totalPrice: Number(item.sizeStock?.product?.price) * newQuantity } : item
      ));
      // Optionally, re-fetch cart to ensure sync
    } catch (error) {
      // Optionally show error toast
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = (id, size) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === id && item.size === size))
    );
    setTimeout(() => {
      const updatedCart = cart.filter(
        (item) => !(item.id === id && item.size === size)
      );
      console.log(updatedCart)
      updateLocalStorage(updatedCart);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      {loading && <Spinner />}
      <div className="flex items-center">
        <h2 className="text-lg border-b pb-2 text-[#171717]">
          <span className="text-[#707070]">YOUR</span> CART
        </h2>
        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
      </div>
      <div className="mt-4">
        <AnimatePresence>
          {cart.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between border-b py-4"
            >
              <img
                src={item.sizeStock?.product?.image?.[0]}
                alt={item.sizeStock?.product?.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 ml-4">
                <p className="text-[14px] text-[#494949]">{item.sizeStock?.product?.name}</p>
                <div className="flex items-center mt-2 gap-8">
                  <span>Size: <b>{item.sizeStock?.size}</b></span>
                  <span>Price: <b>${item.sizeStock?.product?.price}</b></span>
                  <span className="flex items-center gap-2">
                    Quantity:
                    <button
                      className="p-1 border rounded disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={updatingId === item.id || item.quantity <= 1}
                    >
                      <FaMinus size={12} />
                    </button>
                    <b>{item.quantity}</b>
                    <button
                      className="p-1 border rounded disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingId === item.id}
                    >
                      <FaPlus size={12} />
                    </button>
                    {updatingId === item.id && (
                      <span className="ml-2"><SpinnerSmall /></span>
                    )}
                  </span>
                  <span>Total: <b>${item.totalPrice}</b></span>
                </div>
              </div>
              <div className="ml-4 cursor-pointer">
                <GoTrash onClick={() => removeItem(item.id, item.size)} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-6 pt-4 w-1/2 ml-auto">
        <div className="flex items-center">
          <h2 className="text-lg border-b pb-2 text-[#171717]">
            <span className="text-[#707070]">CART</span> TOTALS
          </h2>
          <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
        </div>
        <div className="flex justify-between text-gray-600 mt-2">
          <span>Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600 mt-2">
          <span>Shipping</span>
          <span>{shippingFee === 0 ? "Free" : `$${shippingFee}`}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-2">
          <span>Total</span>
          <span>${(cartTotal + shippingFee).toFixed(2)}</span>
        </div>
        <button
          className="w-1/2 ml-auto block mt-4 text-[12px] bg-black text-white py-2 rounded hover:bg-gray-800"
          onClick={() => cartId && navigate(`/check-out/${cartId}`)}
          disabled={loading}
        >
          PROCEED TO CHECKOUT
        </button>
      </div>
    </div>
  );
}

function SpinnerSmall() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin align-middle"></span>
  );
}
