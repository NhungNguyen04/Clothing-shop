import { useState } from "react";
import { GoTrash } from "react-icons/go";
const initialCart = [
  { id: 1, name: "Men Round Neck Pure Cotton T-shirt", price: 149, size: "L", quantity: 1, image: "https://via.placeholder.com/60" },
  { id: 2, name: "Men Round Neck Pure Cotton T-shirt", price: 149, size: "L", quantity: 1, image: "https://via.placeholder.com/60" }
];

export default function Cart() {
  const [cart, setCart] = useState(initialCart);
  const shippingFee = 10;

  const updateQuantity = (id, quantity) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: quantity } : item));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex items-center">
        <h2 className="text-lg border-b pb-2 text-[#171717]"><span className="text-[#707070]">YOUR</span> CART</h2>
        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
      </div>
      <div className="mt-4">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b py-4">
            <img src="https://m.yodycdn.com/fit-in/filters:format(webp)/products/ao-khoac-nam-yody-AKM7019-DE1%20(1).jpg" alt={item.name} className="w-16 h-16 object-cover rounded" />
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
              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
              className="w-12 border p-1 text-center rounded" 
              min="1"
              />
            <div className="ml-4 cursor-pointer ">
              <GoTrash/>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 w-1/2 ml-auto">
        <div className="flex items-center">
          <h2 className="text-lg border-b pb-2 text-[#171717]"><span className="text-[#707070]">CART</span> TOTALS</h2>
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
        <button className="w-1/2 ml-auto block mt-4 text-[12px] bg-black text-white py-2 rounded hover:bg-gray-800">
          PROCEED TO CHECKOUT
        </button>
      </div>
    </div>
  );
}
