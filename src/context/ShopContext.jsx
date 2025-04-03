import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";

// eslint-disable-next-line react-refresh/only-export-components
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {};
  });

  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (itemId, productSize, price, sellerId) => {
    if (!productSize) {
      toast.error("Please select a size");
      return;
    }

    if (!price || price <= 0) {
      toast.error("Invalid price");
      return;
    }

    setCartItems((prevCart) => {
      const updatedCart = { ...prevCart };

      if (!updatedCart[itemId]) {
        updatedCart[itemId] = []; // Ensure it's an array
      }

      // Check if updatedCart[itemId] is an array before using find
      const existingSize = Array.isArray(updatedCart[itemId]) ? 
        updatedCart[itemId].find(item => item.size === productSize && item.sellerId === sellerId) : null;

      if (existingSize) {
        existingSize.quantity += 1;
      } else {
        updatedCart[itemId].push({ size: productSize, quantity: 1, price, sellerId });
      }

      return updatedCart;
    });
  };

  
  
  

  const getCartCount = () => {
    return Object.keys(cartItems).length;
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    cartTotal,
    setCartTotal,
  };

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

ShopContextProvider.propTypes = {
  children: PropTypes.node,
};

export default ShopContextProvider;
