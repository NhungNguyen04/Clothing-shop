import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoTrash } from "react-icons/go";
import axiosInstance from '../api/axiosInstance';
export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const shippingFee = 10;

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
    
    Object.keys(storedCart).forEach(async (productId) => {
      try {
        const response = await axiosInstance.get(`/products/${productId}`)
        const product = response.data.data;

        setCart((prevCart) => [
          ...prevCart,
          ...Object.entries(storedCart[productId]).map(([size, quantity]) => ({
            id: productId,
            name: product.name,
            price: product.price,
            size,
            quantity,
            image: product.image[0] || "https://cdn.vectorstock.com/i/500p/46/50/missing-picture-page-for-website-design-or-mobile-vector-27814650.jpg",
          })),
        ]);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    });
  }, []);

  const updateQuantity = (id, size, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id, size) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.size === size)));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex items-center">
        <h2 className="text-lg border-b pb-2 text-[#171717]">
          <span className="text-[#707070]">YOUR</span> CART
        </h2>
        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
      </div>
      <div className="mt-4">
        {cart.map((item) => (
          <div key={`${item.id}-${item.size}`} className="flex items-center justify-between border-b py-4">
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1 ml-4">
              <p className="text-[14px] text-[#494949]">{item.name}</p>
              <div className="flex items-center mt-2">
                <p className="text-[#494949]">${item.price}</p>
                <p className="text-sm bg-[#FBFBFB] border border-[#DFDFDF] inline-block px-3 py-1 rounded ml-4">{item.size}</p>
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
          </div>
        ))}
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
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600 mt-2">
          <span>Shipping</span>
          <span>{shippingFee === 0 ? "Free" : `$${shippingFee}`}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
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
