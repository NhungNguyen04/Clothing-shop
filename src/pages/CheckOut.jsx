import { useEffect, useState, useRef } from "react";
import DeliveryInformation from "../components/DeliInformation";
import { useAuthStore } from "../store/AuthStore";
import { useCartStore } from "../store/CartStore";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import paymentService from "../services/payment";
import addressService from "../services/address";
import { useOrderStore } from "../store/OrderStore";
import axiosInstance from "../services/axiosInstance";

const CheckOut = () => {
    const { cartId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const { user } = useAuthStore();
    const { 
        cart, 
        isLoading: loadingCart, 
        getUserCart 
    } = useCartStore();
    const [selectedItems, setSelectedItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [deliveryInfo, setDeliveryInfo] = useState({
        phoneNumber: "",
        address: "",
        street: "",
        ward: "",
        district: "",
        province: "",
        postalCode: ""
    });
    const [redirectingToPayment, setRedirectingToPayment] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [saveNewAddress, setSaveNewAddress] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState("");
    const [receiptUrl, setReceiptUrl] = useState("");
    const [receiptPreview, setReceiptPreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const fileInputRef = useRef(null);
    const {checkoutCart} = useOrderStore();
      // Check if returning from payment gateway
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
        const vnp_OrderInfo = queryParams.get('vnp_OrderInfo');
        const vnp_TransactionStatus = queryParams.get('vnp_TransactionStatus');
        
        // If returning from VNPAY with query parameters
        if (vnp_ResponseCode && vnp_OrderInfo) {
            const paymentOrderId = vnp_OrderInfo.split('_').pop(); // Extract order ID from order info
              // Check if payment was successful
            if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
                // Payment successful
                navigate(`/payment-success?orderId=${paymentOrderId}`);            } else {
                // Payment failed
                const errorMessage = paymentService.getVnpayErrorMessage(vnp_ResponseCode);
                paymentService.handlePaymentFailure(navigate, {
                    message: errorMessage,
                    orderId: paymentOrderId,
                    errorCode: vnp_ResponseCode
                });
                navigate(`/payment-success?message=Payment failed with code: ${vnp_ResponseCode}`);
            }
        }
    }, [navigate]); // Include navigate in the dependency array
    
    // Fetch cart data when component mounts
    useEffect(() => {
        if (!cartId || !user?.id) return;
        
        const fetchCart = async () => {
            try {
                await getUserCart();
            } catch (error) {
                console.error('Error fetching cart:', error);
                toast.error("Failed to load cart data");
                navigate('/cart');
            }
        };
        
        fetchCart();
    }, [cartId, user?.id, getUserCart, navigate]);
    
    // Fetch user addresses
    useEffect(() => {
        if (!user?.id) return;
        
        const fetchAddresses = async () => {
            try {
                setLoadingAddresses(true);
                const addresses = await addressService.getUserAddresses(user.id);
                setUserAddresses(addresses);
                
                // Set the default address if available
                if (addresses.length > 0) {
                    const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
                    setSelectedAddressId(defaultAddress.id);
                      // Populate delivery info with the selected address
                    // Parse the district, ward, and province from the full address if available
                    let district = "", ward = "", province = "";
                    if (defaultAddress.fullAddress) {
                        const addressParts = defaultAddress.fullAddress.split(', ');
                        if (addressParts.length >= 3) {
                            ward = addressParts[addressParts.length - 3] || "";
                            district = addressParts[addressParts.length - 2] || "";
                            province = addressParts[addressParts.length - 1] || "";
                        }
                    }
                    
                    setDeliveryInfo({
                        phoneNumber: defaultAddress.phoneNumber || "",
                        address: defaultAddress.address || "",
                        street: defaultAddress.street || "",
                        ward: ward,
                        district: district,
                        province: province,
                        postalCode: defaultAddress.postalCode || ""
                    });
                }
            } catch (error) {
                console.error('Error fetching addresses:', error);
                toast.error("Failed to load your addresses");
            } finally {
                setLoadingAddresses(false);
            }
        };
        
        fetchAddresses();
    }, [user?.id]);
    
    // Process cart items when cart is loaded
    useEffect(() => {
        if (!cart || !cart.cartItems) return;
        
        // Check localStorage for selected items from the cart page
        try {
            const storedSelectedItems = localStorage.getItem('selectedCartItems');
            let selectedItemIds = [];
            
            if (storedSelectedItems) {
                selectedItemIds = JSON.parse(storedSelectedItems);
                // Filter cart items to only include selected ones
                const filteredItems = cart.cartItems.filter(item => 
                    selectedItemIds.includes(item.id)
                );
                setSelectedItems(filteredItems);
                
                // Calculate subtotal from selected items
                const newSubtotal = filteredItems.reduce(
                    (sum, item) => sum + Number(item.totalPrice), 0
                );
                setSubtotal(newSubtotal);
            } else {
                // If no selection stored, use all items
                setSelectedItems(cart.cartItems);
                const newSubtotal = cart.cartItems.reduce(
                    (sum, item) => sum + Number(item.totalPrice), 0
                );
                setSubtotal(newSubtotal);
            }
        } catch (error) {
            console.error('Error processing selected items:', error);
            // Fallback to using all cart items
            setSelectedItems(cart.cartItems);
            const newSubtotal = cart.cartItems.reduce(
                (sum, item) => sum + Number(item.totalPrice), 0
            );
            setSubtotal(newSubtotal);
        }
        
        // Pre-fill delivery info if user data is available
        if (user) {
            setDeliveryInfo(prev => ({
                ...prev,
                email: user.email || prev.email
            }));
        }
    }, [cart, user]);    
    const handlePlaceOrder = async () => {
        // Validate delivery information
        if ((showNewAddressForm && (!deliveryInfo.phoneNumber || !deliveryInfo.street || !deliveryInfo.ward || !deliveryInfo.district || !deliveryInfo.province || !deliveryInfo.postalCode)) || 
            (!showNewAddressForm && !selectedAddressId)) {
            toast.error('Please provide complete delivery information');
            return;
        }

        console.log('Placing order with delivery info:', deliveryInfo);
        
        if (selectedItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
          try {
            setIsLoading(true);
            
            // Combine address fields into a single string
            const combinedAddress = showNewAddressForm 
                ? `${deliveryInfo.street}, ${deliveryInfo.ward}, ${deliveryInfo.district}, ${deliveryInfo.province}`
                : (deliveryInfo.address || `${deliveryInfo.street}, ${deliveryInfo.ward}, ${deliveryInfo.district}, ${deliveryInfo.province}`);
            
            // If creating a new address, save it first
            if (showNewAddressForm && saveNewAddress) {
                try {
                    await handleSaveNewAddress();
                } catch (error) {
                    console.error('Error saving address:', error);
                    // Continue with order placement even if address save fails
                }
            }            console.log('paymentMethod:', paymentMethod);                try {                // Create order regardless of payment method
                const orderRes = await checkoutCart(
                    combinedAddress, // Using the combined address with fallbacks
                    deliveryInfo.phoneNumber,
                    deliveryInfo.postalCode,
                    paymentMethod.toUpperCase(),
                );

                console.log('Order response:', orderRes);
                
                // Check if we got a valid response
                if (!orderRes) {
                    throw new Error('No response received from the checkout service');
                }
                  if (!orderRes.success) {
                    throw new Error(orderRes.message || 'Failed to create order');
                }
                
                // Validate that we have data in the response
                if (!orderRes.data) {
                    throw new Error('No order data received from the server');
                }
                
                // Get orders from the data field - ensure it's always an array
                let orders = orderRes.data;
                if (!Array.isArray(orders)) {
                    orders = [orders];
                }
                
                if (!orders || orders.length === 0) {
                    throw new Error('No orders were created');
                }
                
                // Find the first non-cancelled order for payment reference
                const activeOrder = orders.find(order => order.status !== 'CANCELLED') || orders[0];
                const orderId = activeOrder?.id || "";
                setOrderId(orderId);
                
                // Save all order IDs for reference (could be used for order tracking)
                const allOrderIds = orders.map(order => order.id);
                localStorage.setItem('recentOrderIds', JSON.stringify(allOrderIds));
                
                console.log('Order(s) created successfully:', orders);
                
                // Clear selected items from localStorage after order is placed
                localStorage.removeItem('selectedCartItems');
                
                // Handle different payment methods
                if (paymentMethod === 'cod') {
                    toast.success('Order placed successfully!');
                    setTimeout(() => {
                        setIsLoading(false);
                        navigate('/order-success');
                    }, 1200);
                } else if (paymentMethod === 'vietqr') {
                    handleOpenQR();
                    setIsLoading(false);                } else if (paymentMethod === 'vnpay') {
                    setRedirectingToPayment(true);
                    
                    try {                        // Debug the order ID
                        console.log('Using order ID for payment:', orderId);
                        
                        // Ensure we have a valid order ID before proceeding
                        if (!orderId) {
                            throw new Error('Missing order ID for payment');
                        }
                        
                        // Call the VNPAY payment service with the order ID
                        const paymentUrl = await paymentService.createVnpayPayment(orderId);
                        
                        if (!paymentUrl) {
                            throw new Error('Invalid payment URL received');
                        }
                        
                        // Redirect to VNPAY payment gateway - use window.location.href for full page redirect
                        // This is important for proper redirect flow with VNPAY
                        console.log('Redirecting to VNPAY:', paymentUrl);
                        window.location.href = paymentUrl;                    } catch (paymentError) {
                        console.error('VNPAY payment error:', paymentError);
                        setIsLoading(false);
                        setRedirectingToPayment(false);
                        
                        // Use the payment failure component for a better user experience
                        paymentService.handlePaymentFailure(navigate, {
                            message: 'Failed to initiate payment. Please try again or choose another payment method.',
                            orderId: orderId,
                            errorCode: 'INIT_ERROR'
                        });
                    }
                }
            } catch (orderError) {
                console.error('Error creating order:', orderError);
                toast.error(orderError.message || 'Failed to create order. Please try again.');
                setIsLoading(false);
                setRedirectingToPayment(false);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
            setIsLoading(false);
        }
    };

    const handleDeliveryChange = (name, value) => {
        setDeliveryInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };    
    
    const handleAddressSelect = (addressId) => {
        const selected = userAddresses.find(addr => addr.id === addressId);
        if (selected) {
            setSelectedAddressId(addressId);
            setShowNewAddressForm(false);
            
            // Parse the district, ward, and province from the full address if available
            let district = "", ward = "", province = "";
            if (selected.fullAddress) {
                const addressParts = selected.fullAddress.split(', ');
                if (addressParts.length >= 3) {
                    ward = addressParts[addressParts.length - 3] || "";
                    district = addressParts[addressParts.length - 2] || "";
                    province = addressParts[addressParts.length - 1] || "";
                }
            }
            
            setDeliveryInfo({
                phoneNumber: selected.phoneNumber || "",
                address: selected.fullAddress || "",
                street: selected.street || "",
                ward: ward,
                district: district,
                province: province,
                postalCode: selected.postalCode || ""
            });
        }
    };    
    
    const handleSaveNewAddress = async () => {
        if (!user?.id) return;

        console.log('Saving new address:', deliveryInfo);
        
        // Check if district and province are missing, which might be the issue
        if (!deliveryInfo.district) {
            console.warn('Missing district in deliveryInfo:', deliveryInfo);
        }
        if (!deliveryInfo.province) {
            console.warn('Missing province in deliveryInfo:', deliveryInfo);
        }
        
        if (!deliveryInfo.phoneNumber || !deliveryInfo.street || !deliveryInfo.ward || !deliveryInfo.district || !deliveryInfo.province) {
            toast.error('Please fill in all required address fields');
            return;
        }
        
        try {
            setIsLoading(true);
            const fullAddress = `${deliveryInfo.street}, ${deliveryInfo.ward}, ${deliveryInfo.district}, ${deliveryInfo.province}`;
            
            const newAddress = {
                userId: user.id,
                phoneNumber: deliveryInfo.phoneNumber,
                address: fullAddress,
                street: deliveryInfo.street,
                postalCode: deliveryInfo.postalCode,
                isDefault: userAddresses.length === 0 // Set as default if it's the first address
            };
            
            const savedAddress = await addressService.createAddress(newAddress);
            setUserAddresses(prev => [...prev, savedAddress]);
            setSelectedAddressId(savedAddress.id);
            setShowNewAddressForm(false);
            toast.success('New address saved successfully');
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save new address');
        } finally {
            setIsLoading(false);
        }
    };    const handleOpenQR = () => {
        const amount = subtotal + 10; // Add shipping fee
        // Include orderId in the payment reference for better tracking
        const addInfo = orderId ? `Thanh toán đơn hàng ${orderId}` : 'Thanh toán cho Shop Forever';
        const encodedAddInfo = encodeURIComponent(addInfo);
        const url = `https://img.vietqr.io/image/970403-070126475657-print.png?amount=${amount}&addInfo=${encodedAddInfo}&accountName=SHOP%20FOREVER`;
        setQrUrl(url);
        setShowQR(true);
    };
      const handleUploadReceipt = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setReceiptPreview(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await axiosInstance.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReceiptUrl(res.data.data);
            
            // Get all order IDs from localStorage if available, or use current orderId
            let orderIds = [];
            try {
                const storedOrderIds = localStorage.getItem('recentOrderIds');
                if (storedOrderIds) {
                    orderIds = JSON.parse(storedOrderIds);
                } else if (orderId) {
                    orderIds = [orderId];
                }
            } catch (e) {
                if (orderId) orderIds = [orderId];
            }
            
            // If we have order IDs, create transaction records for all orders
            if (orderIds && orderIds.length > 0) {
                const transactionPromises = orderIds.map(id => 
                    axiosInstance.post('/transaction', {
                        orderId: id,
                        amount: subtotal + 10, // Add shipping fee
                        status: 'PENDING',
                        image: res.data.data
                    })
                );
                
                await Promise.all(transactionPromises);
                
                // Clean up the stored order IDs
                localStorage.removeItem('recentOrderIds');
                
                setShowQR(false);
                setPaymentMethod('cod');
                toast.success('Đã gửi biên lai, chờ xác nhận!');
                setTimeout(() => {
                    navigate('/order-success');
                }, 1200);
            } else {
                toast.error('Không tìm thấy thông tin đơn hàng!');
            }
        } catch (err) {
            toast.error('Upload thất bại!');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex mt-4">
            {loadingCart && <Spinner />}           
             <div className="w-1/2">
                <div className="pb-4">
                    <h2 className="text-lg border-b pb-2 text-[#171717]">
                        <span className="text-[#707070]">DELIVERY</span> ADDRESSES
                    </h2>
                    
                    {loadingAddresses ? (
                        <div className="py-4 text-center">
                            <Spinner />
                            <p className="mt-2 text-gray-500">Loading your addresses...</p>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {/* Saved addresses */}
                            {userAddresses.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-medium">Your Saved Addresses</h3>
                                    {userAddresses.map(address => (
                                        <div 
                                            key={address.id} 
                                            className={`border p-3 rounded-lg cursor-pointer transition-colors ${selectedAddressId === address.id ? 'border-pink-500 bg-pink-50' : 'hover:bg-gray-50'}`}
                                            onClick={() => handleAddressSelect(address.id)}
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-semibold">{address.phoneNumber}</span>
                                                {address.isDefault && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                                            <p className="text-sm text-gray-600">{address.postalCode}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Add a new address button */}
                            <div>
                                <button
                                    type="button"
                                    className="text-pink-600 flex items-center gap-1 text-sm font-medium"
                                    onClick={() => {                                        setShowNewAddressForm(!showNewAddressForm);
                                        if (!showNewAddressForm) {
                                            setSelectedAddressId(null);
                                            setDeliveryInfo({
                                                phoneNumber: "",
                                                address: "",
                                                street: "",
                                                ward: "",
                                                district: "",
                                                province: "",
                                                postalCode: ""
                                            });
                                        }
                                    }}
                                >
                                    <span>{showNewAddressForm ? '← Back to saved addresses' : '+ Add a new address'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Show delivery information form if adding a new address */}
                {showNewAddressForm && (
                    <div className="mt-6">
                        <h3 className="font-medium mb-4">New Delivery Address</h3>
                        <DeliveryInformation
                            deliveryInfo={deliveryInfo}
                            onDeliveryChange={handleDeliveryChange}
                        />
                        <div className="mt-4 flex items-center">
                            <input 
                                type="checkbox" 
                                id="saveAddress" 
                                checked={saveNewAddress}
                                onChange={() => setSaveNewAddress(!saveNewAddress)} 
                                className="mr-2"
                            />
                            <label htmlFor="saveAddress" className="text-sm">Save this address for future use</label>
                        </div>
                        {saveNewAddress && (
                            <button 
                                type="button" 
                                className="mt-3 px-4 py-2 bg-pink-600 text-white rounded text-sm"
                                onClick={handleSaveNewAddress}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Address'}
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="ml-12 w-1/2">                <div>
                  {loadingCart ? (
                    <div className="py-4 text-center">Loading cart items...</div>
                  ) : selectedItems.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-gray-500">No items selected for checkout</p>
                      <button 
                        className="mt-2 px-4 py-2 bg-pink-600 text-white rounded"
                        onClick={() => navigate('/cart')}
                      >
                        Return to Cart
                      </button>
                    </div>
                  ) : (
                    selectedItems.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between border-b py-4">
                        <img src={item.sizeStock?.product?.image?.[0]} alt={item.sizeStock?.product?.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1 ml-4">
                          <p className="text-[14px] text-[#494949]">{item.sizeStock?.product?.name}</p>
                          <div className="flex flex-wrap items-center mt-2 gap-x-8 gap-y-2">
                            <span>Size: <b>{item.sizeStock?.size}</b></span>
                            <span>Price: <b>${Number(item.sizeStock?.product?.price).toFixed(2)}</b></span>
                            <span>Quantity: <b>{item.quantity}</b></span>
                            <span>Total: <b>${Number(item.totalPrice).toFixed(2)}</b></span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div>
                    <div className="flex items-center mt-6">
                        <h2 className="text-lg border-b pb-2 text-[#171717]">
                            <span className="text-[#707070]">CART</span> TOTALS
                        </h2>
                        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
                    </div>                    <div className="flex justify-between text-gray-600 mt-2">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mt-2">
                        <span>Shipping</span>
                        <span>$10</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total</span>
                        <span>${(subtotal + 10).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center mt-6">
                        <h2 className="text-lg border-b pb-2 text-[#171717]">
                            <span className="text-[#707070]">PAYMENT</span> METHOD
                        </h2>
                        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
                    </div>                    <div className="flex gap-4 mt-6 flex-wrap">
                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === "vietqr"}
                                onChange={() => {
                                    setPaymentMethod("vietqr");
                                }}
                            />
                            <span className="text-pink-600 font-bold">VietQR</span>
                        </label>
                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === "vnpay"}
                                onChange={() => setPaymentMethod("vnpay")}
                            />
                            <span className="text-pink-600 font-bold">VNPAY</span>
                        </label>
                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === "cod"}
                                onChange={() => setPaymentMethod("cod")}
                            />
                            <span>Cash on Delivery</span>
                        </label>
                    </div>                    <button
                        className="w-1/2 ml-auto block mt-4 text-[12px] bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-500"
                        onClick={handlePlaceOrder}
                        disabled={isLoading || redirectingToPayment || selectedItems.length === 0 || subtotal === 0}
                    >
                        {isLoading ? "Processing..." : redirectingToPayment ? "Redirecting to payment..." : "PLACE ORDER"}
                    </button>
                </div>
            </div>
            {showQR && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                        <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain" />
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadReceipt} className="mt-4" />
                        {receiptPreview && (
                            <img src={receiptPreview} alt="Receipt Preview" className="mt-4 w-48 h-48 object-contain border rounded" />
                        )}
                        {uploading && <div className="mt-2 text-pink-600">Đang upload...</div>}
                        {receiptUrl && <div className="mt-2 text-green-600">Đã upload biên lai!</div>}
                        <button onClick={() => setShowQR(false)} className="mt-4 text-gray-600">Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckOut;
