import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoTrash } from "react-icons/go";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import { ShopContext } from "../context/ShopContext";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const shippingFee = 10;
  const {cartTotal, setCartTotal} = useContext(ShopContext)
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
    
    const fetchCartItems = async () => {
      const cartItems = [];
      let subtotal = 0;
  
      for (const productId of Object.keys(storedCart)) {
        try {
          const response = await axiosInstance.get(`/products/${productId}`);
          const product = response.data.data;
  
          const items = Object.entries(storedCart[productId]).map(([, item]) => {
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal; // Tính tổng giá trị sản phẩm trong giỏ hàng
            return {
              id: productId,
              name: product.name,
              sellerId: product.sellerId,
              price: product.price,
              size: item.size,
              quantity: item.quantity,
              image:
                product.image[0] ||
                "https://cdn.vectorstock.com/i/500p/46/50/missing-picture-page-for-website-design-or-mobile-vector-27814650.jpg",
            };
          });
  
          cartItems.push(...items);
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      }
  
      setCart(cartItems);
      setCartTotal(subtotal);
    };
  
    fetchCartItems();
  }, [setCartTotal]);
  


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

  const updateQuantity = (id, size, quantity) => {
    if (quantity < 1) return;
    const updatedCart = cart.map((item) =>
      item.id === id && item.size === size ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    updateLocalStorage(updatedCart);
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
      <div className="flex items-center">
        <h2 className="text-lg border-b pb-2 text-[#171717]">
          <span className="text-[#707070]">YOUR</span> CART
        </h2>
        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
      </div>
      <div className="mt-4">
        <AnimatePresence>
          {cart.map((item) => (
            <motion.div
              key={`${item.id}-${item.size}`}
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between border-b py-4"
            >
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1 ml-4">
                <p className="text-[14px] text-[#494949]">{item.name}</p>
                <div className="flex items-center mt-2">
                  <p className="text-[#494949]">${item.price}</p>
                  <p className="text-sm bg-[#FBFBFB] border border-[#DFDFDF] inline-block px-3 py-1 rounded ml-4">
                    {item.size}
                  </p>
                </div>
              </div>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, item.size, parseInt(e.target.value))}
                className="w-12 border p-1 text-center rounded"
                min="1"
              />
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
          onClick={() => navigate("/check-out")}
        >
          PROCEED TO CHECKOUT
        </button>
      </div>
    </div>
  );
}
