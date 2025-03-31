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
    // Load cart data from localStorage on initial render
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {};
  });

  // Save cartItems to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (itemId, productSize) => {
    if (!productSize) {
      toast.error("Please select a size");
      return;
    }

    setCartItems((prevCart) => {
      const updatedCart = { ...prevCart };

      if (!updatedCart[itemId]) {
        updatedCart[itemId] = {};
      }

      updatedCart[itemId][productSize] = (updatedCart[itemId][productSize] || 0) + 1;

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
  };

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

ShopContextProvider.propTypes = {
  children: PropTypes.node,
};

export default ShopContextProvider;
