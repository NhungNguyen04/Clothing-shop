import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoTrash } from "react-icons/go";
import { FaPlus, FaMinus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/CartStore";
import { useAuthStore } from "../store/AuthStore";
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

export default function Cart() {
  const navigate = useNavigate();
  const shippingFee = 10;
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedSellers, setSelectedSellers] = useState({});
  const [subtotal, setSubtotal] = useState(0);
  const { user } = useAuthStore();
  const { 
    cart, 
    itemsBySeller, 
    isLoading: loading, 
    getUserCart, 
    updateQuantity, 
    removeItem,
    organizeItemsBySeller
  } = useCartStore();
  const [cartId, setCartId] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  useEffect(() => {
    if (!user || !user.id) return;
    const fetchCart = async () => {
      try {
        await getUserCart();
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error("Failed to load cart");
      }
    };
    fetchCart();
  }, [user, getUserCart]);

  useEffect(() => {
    if (cart?.id) {
      setCartId(cart.id);
    }
    
    // Initialize selected items when cart changes
    if (cart?.cartItems) {
      const newSelections = {};
      const newSellerSelections = {};
      
      cart.cartItems.forEach(item => {
        newSelections[item.id] = true; // Select all items by default
        newSellerSelections[item.sizeStock.product.sellerId] = true; // Select all sellers by default
      });
      
      setSelectedItems(newSelections);
      setSelectedSellers(newSellerSelections);
    }
  }, [cart]);

  // Calculate subtotal based on selected items
  useEffect(() => {
    if (!cart?.cartItems) return;
    
    const newSubtotal = cart.cartItems.reduce((sum, item) => {
      if (selectedItems[item.id]) {
        return sum + Number(item.totalPrice);
      }
      return sum;
    }, 0);
    
    setSubtotal(newSubtotal);
  }, [cart, selectedItems]);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingId(cartItemId);
    
    try {
      await updateQuantity(cartItemId, newQuantity);
      toast.success("Quantity updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };
  
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  const toggleSelectSeller = (sellerId) => {
    // Toggle the seller selection state
    const newSellerState = !selectedSellers[sellerId];
    setSelectedSellers(prev => ({
      ...prev,
      [sellerId]: newSellerState
    }));
    
    // Apply the same state to all items from this seller
    if (itemsBySeller) {
      const sellerItems = itemsBySeller.find(s => s.sellerId === sellerId);
      if (sellerItems) {
        const updatedItems = { ...selectedItems };
        sellerItems.items.forEach(item => {
          updatedItems[item.id] = newSellerState;
        });
        setSelectedItems(updatedItems);
      }
    }
  };
  
  const isAllSellerItemsSelected = (sellerId) => {
    if (!itemsBySeller) return false;
    
    const sellerItems = itemsBySeller.find(s => s.sellerId === sellerId);
    if (!sellerItems) return false;
    
    return sellerItems.items.every(item => selectedItems[item.id]);
  };
  
  const handleRemoveSellerItems = async (sellerId) => {
    try {
      await useCartStore.getState().removeSellerItems(sellerId);
      toast.success("Items removed from cart");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove items");
    }
  };
  const handleRemoveItem = async (id) => {
    try {
      await removeItem(id);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
      {loading && <Spinner />}
      <div className="flex items-center">
        <h2 className="text-lg border-b pb-2 text-[#171717]">
          <span className="text-[#707070]">YOUR</span> CART
        </h2>
        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
      </div>
      
      {!loading && (!cart?.cartItems || cart.cartItems.length === 0) && (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 mb-4">Your cart is empty</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      )}
      
      {itemsBySeller && itemsBySeller.length > 0 && (
        <div className="mt-4 divide-y">
          {itemsBySeller.map((sellerGroup) => (
            <div key={sellerGroup.sellerId} className="py-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <div 
                  className="cursor-pointer text-2xl" 
                  onClick={() => toggleSelectSeller(sellerGroup.sellerId)}
                >
                  {isAllSellerItemsSelected(sellerGroup.sellerId) ? (
                    <MdCheckBox className="text-pink-600" />
                  ) : (
                    <MdCheckBoxOutlineBlank />
                  )}
                </div>
                <h3 className="text-lg font-medium flex-grow">
                  {sellerGroup.sellerName || "Unknown Seller"}
                </h3>
                <button
                  onClick={() => handleRemoveSellerItems(sellerGroup.sellerId)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove All
                </button>
              </div>

              <AnimatePresence>
                {sellerGroup.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between py-4 pl-8 border-b border-gray-100"
                  >
                    <div 
                      className="cursor-pointer text-2xl mr-2" 
                      onClick={() => toggleSelectItem(item.id)}
                    >
                      {selectedItems[item.id] ? (
                        <MdCheckBox className="text-pink-600" />
                      ) : (
                        <MdCheckBoxOutlineBlank />
                      )}
                    </div>
                    
                    <img
                      src={item.sizeStock?.product?.image?.[0]}
                      alt={item.sizeStock?.product?.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 ml-4">
                      <p className="text-[14px] text-[#494949]">{item.sizeStock?.product?.name}</p>
                      <div className="flex flex-wrap items-center mt-2 gap-x-8 gap-y-2">
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
                      <GoTrash onClick={() => handleRemoveItem(item.id)} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 pt-4 w-1/2 ml-auto">
        <button
          className="w-1/2 ml-auto block mt-4 text-[12px] bg-black text-white py-2 rounded hover:bg-gray-800"
          onClick={() => {
            if (cartId) {
              // Save selected item IDs to localStorage before navigating to checkout
              const selectedItemIds = Object.entries(selectedItems)
                .filter(([_, isSelected]) => isSelected)
                .map(([id]) => id);
              localStorage.setItem('selectedCartItems', JSON.stringify(selectedItemIds));
              navigate(`/check-out/${cartId}`);
            }
          }}
          disabled={loading || subtotal === 0}
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
