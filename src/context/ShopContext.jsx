import { createContext, useEffect, useState } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  const currency = '$';
  const delivery_fee = 10;
  const [ search, setSearch ] = useState('');
  const [ showSearch, setShowSearch ] = useState(false);
  const [ cartItems, setCartItems ] = useState({});

  const addToCart = async (itemId, productSize) => {
    if (!productSize) {
      toast.error('Please select a size');
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][productSize]) {
        cartData[itemId][productSize] += 1;
      }
      else {
        cartData[itemId][productSize] = 1;
      } 
    } else {
      cartData[itemId] = {};
      cartData[itemId][productSize] = 1;
    }
    setCartItems(cartData);
  }

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const size in cartItems[items]) {
        try {
          if (cartItems[items][size] > 0) {
            totalCount += cartItems[items][size];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalCount;
  }
  
  const value = {
    products, currency, delivery_fee, 
    search, setSearch, showSearch, setShowSearch,
    cartItems, addToCart, getCartCount
  }

  useEffect(() => {
    console.log(cartItems);
  }, [cartItems]);

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  )

}

export default ShopContextProvider;