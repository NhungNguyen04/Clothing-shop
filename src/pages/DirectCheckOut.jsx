import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/AuthStore';
import { useProductStore } from '../store/ProductStore';
import addressService from "../services/address";
import { OrderService } from '../services/order';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import paymentService from "../services/payment";
import { useOrderStore } from "../store/OrderStore";
import axiosInstance from "../services/axiosInstance";

const DirectCheckOut = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const { user } = useAuthStore();
    const [subtotal, setSubtotal] = useState(0);
    const [deliveryInfo, setDeliveryInfo] = useState({
        phoneNumber: "",
        address: "",
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
      // Product state
    const [product, setProduct] = useState(null);
    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [sizeStockId, setSizeStockId] = useState('');
    
    // Product store
    const { 
        fetchProductById, 
        product: storeProduct, 
        isLoading: productLoading,
        getSizeStockByProductIdAndSize
    } = useProductStore();

    const { checkoutCart } = useOrderStore();
    // Check if returning from payment gateway
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
        const vnp_OrderInfo = queryParams.get('vnp_OrderInfo');
        const vnp_TransactionStatus = queryParams.get('vnp_TransactionStatus');
        
        if (vnp_ResponseCode && vnp_OrderInfo) {
            const paymentOrderId = vnp_OrderInfo.split('_').pop(); // Extract order ID from order info
            
            // Check if payment was successful
            if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
                // Payment successful
                toast.success("Payment successful!");
                navigate(`/payment-success?orderId=${paymentOrderId}`);
            } else {
                // Payment failed
                const errorMessage = paymentService.getVnpayErrorMessage(vnp_ResponseCode);
                paymentService.handlePaymentFailure(navigate, {
                    message: errorMessage,
                    orderId: paymentOrderId,
                    errorCode: vnp_ResponseCode
                });
            }
        }
    }, [location, navigate, orderId]);
      // Get product information from ProductStore and query parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const sizeParam = queryParams.get('size');
        const quantityParam = queryParams.get('quantity');
        
        if (productId) {
            // Fetch product from ProductStore
            fetchProductById(productId);
            
            // Set size and quantity from query params
            if (sizeParam) setSize(sizeParam);
            if (quantityParam) setQuantity(parseInt(quantityParam) || 1);
        } else {
            // No product ID available
            toast.error("No product selected for checkout");
            navigate('/');
        }
    }, [productId, location.search, fetchProductById, navigate]);
    
    // Process the fetched product data
    useEffect(() => {
        if (storeProduct) {
            setProduct(storeProduct);
            
            // Calculate subtotal
            setSubtotal(storeProduct.price * quantity);
            
            // If size is set, find the corresponding sizeStock
            if (size) {
                const sizeStock = getSizeStockByProductIdAndSize(productId, size);
                if (sizeStock) {
                    setSizeStockId(sizeStock.id);
                } else {
                    toast.error(`Size ${size} is not available for this product`);
                    navigate(`/product/${productId}`);
                }
            } else if (storeProduct.stockSize && storeProduct.stockSize.length > 0) {
                // Default to first available size if none selected
                setSize(storeProduct.stockSize[0].size);
                setSizeStockId(storeProduct.stockSize[0].id);
            } else {
                toast.error("This product has no available sizes");
                navigate(`/product/${productId}`);            }
        }
    }, [storeProduct, size, quantity, productId, navigate, getSizeStockByProductIdAndSize]);
    
    // Fetch user addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user?.id) return;
            
            setLoadingAddresses(true);
            try {
                const response = await addressService.getUserAddresses(user.id);
                console.log("Fetched addresses:", response);
                if (response.length > 0) {
                    setUserAddresses(response);
                    
                    // Select the default address if available
                    const defaultAddress = response.find(addr => addr.isDefault);
                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress.id);
                        // Set delivery info from the default address
                        setDeliveryInfo({
                            phoneNumber: defaultAddress.phoneNumber || "",
                            address: defaultAddress.address || "",
                            postalCode: defaultAddress.postalCode || ""
                        });
                    } else if (response.length > 0) {
                        setSelectedAddressId(response[0].id);
                        handleAddressSelect(response[0].id);
                    }
                }
            } catch (error) {
                console.error("Error fetching addresses:", error);
                toast.error("Couldn't load your saved addresses");
            } finally {
                setLoadingAddresses(false);
            }
        };
        
        fetchAddresses();
    }, [user?.id]);

    const handlePlaceOrder = async () => {

        console.log("Address Info:", deliveryInfo);
        if (!user) {
            toast.error("Please log in to place an order");
            navigate('/login');
            return;
        }
        
        if (!product || !sizeStockId) {
            toast.error("Product information is incomplete");
            return;
        }
        
        if (!deliveryInfo.phoneNumber || !deliveryInfo.address) {
            toast.error("Please provide delivery information");
            return;
        }
        
        setIsLoading(true);
        
        try {
            
            // Create order input
            const orderInput = {
                userId: user.id,
                sellerId: product.sellerId,
                phoneNumber: deliveryInfo.phoneNumber,
                address: deliveryInfo.address,
                postalCode: deliveryInfo.postalCode,
                paymentMethod: paymentMethod.toUpperCase(),
                orderItems: [
                    {
                        sizeStockId: sizeStockId,
                        quantity: quantity,
                        price: product.price
                    }
                ]
            };
            
            // Create order directly (not using cart)
            const response = await OrderService.createOrder(orderInput);
            
            if (response.success && response.data) {
                // Save new address if option is selected
                if (showNewAddressForm && saveNewAddress) {
                    await handleSaveNewAddress();
                }
                
                const orderId = response.data.id;
                setOrderId(orderId);
                
                // Handle different payment methods
                if (paymentMethod === 'cod') {
                    toast.success('Order placed successfully!');
                    navigate(`/order-confirmation/${orderId}`);
                } else if (paymentMethod === 'vietqr') {
                    // Generate QR code for VietQR payment
                    handleOpenQR(orderId, subtotal);
                    setIsLoading(false);
                } else if (paymentMethod === 'vnpay') {
                    setRedirectingToPayment(true);
                    
                    try {
                        // Call the VNPAY payment service with the order ID
                        const paymentUrl = await paymentService.createVnpayPayment(orderId);
                        
                        if (!paymentUrl) {
                            throw new Error('Invalid payment URL received');
                        }
                        
                        // Redirect to VNPAY payment gateway
                        window.location.href = paymentUrl;
                    } catch (paymentError) {
                        console.error('VNPAY payment error:', paymentError);
                        setIsLoading(false);
                        setRedirectingToPayment(false);
                        
                        paymentService.handlePaymentFailure(navigate, {
                            message: 'Failed to initiate payment. Please try again or choose another payment method.',
                            orderId: orderId,
                            errorCode: 'INIT_ERROR'
                        });
                    }
                }
            } else {
                toast.error(response.message || "Failed to place order");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Could not place order. Please try again.");
            setIsLoading(false);
            setRedirectingToPayment(false);
        }
    };

    const handleDeliveryChange = (name, value) => {
        setDeliveryInfo(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        const selected = userAddresses.find(addr => addr.id === addressId);
        if (selected) {
            setDeliveryInfo({
                phoneNumber: selected.phoneNumber || "",
                address: selected.address || "",
                postalCode: selected.postalCode || ""
            });
            setShowNewAddressForm(false);
        }
    };
    
    const handleSaveNewAddress = async () => {
        if (!user?.id) return;
        
        // Check if required fields are provided
        if (!deliveryInfo.phoneNumber || !deliveryInfo.address) {
            toast.error('Please fill in all required address fields');
            return false;
        }
        
        try {
            const newAddress = {
                userId: user.id,
                phoneNumber: deliveryInfo.phoneNumber,
                address: deliveryInfo.address,
                postalCode: deliveryInfo.postalCode,
                isDefault: userAddresses.length === 0 // Set as default if it's the first address
            };
            
            const response = await addressService.createAddress(newAddress);
            if (response.success && response.data) {
                toast.success("Address saved successfully");
                setUserAddresses(prev => [...prev, response.data]);
                setSelectedAddressId(response.data.id);
                return true;
            } else {
                toast.error("Failed to save address");
                return false;
            }
        } catch (error) {
            console.error("Error saving address:", error);
            toast.error("Could not save address");
            return false;
        }
    };
    
    const handleOpenQR = (orderId, amount) => {
        const addInfo = orderId ? `Thanh toán đơn hàng ${orderId}` : 'Thanh toán cho Shop Forever';
        const encodedAddInfo = encodeURIComponent(addInfo);
        const url = `https://img.vietqr.io/image/970403-070126475657-print.png?amount=${amount}&addInfo=${encodedAddInfo}&accountName=SHOP%20FOREVER`;
        setQrUrl(url);
        setShowQR(true);
    };
    
    const handleUploadReceipt = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        setUploading(true);
        try {
            // Preview image
            const reader = new FileReader();
            reader.onload = (e) => {
                setReceiptPreview(e.target.result);
            };
            reader.readAsDataURL(file);
            
            // Upload receipt
            const response = await OrderService.uploadReceipt(orderId, formData);
            if (response.success && response.data) {
                setReceiptUrl(response.data);
                toast.success("Receipt uploaded successfully");
                
                // Create transaction record
                await axiosInstance.post('/transaction', {
                    orderId: orderId,
                    amount: subtotal,
                    status: 'PENDING',
                    image: response.data
                });
                
                setShowQR(false);
                setPaymentMethod('cod');
                // Redirect to confirmation page
                navigate(`/order-confirmation/${orderId}`);
            } else {
                toast.error("Failed to upload receipt");
            }
        } catch (error) {
            console.error("Error uploading receipt:", error);
            toast.error("Could not upload receipt");
        } finally {
            setUploading(false);
        }
    };    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-2xl font-bold mb-6">Direct Checkout</h1>
            
            {isLoading || redirectingToPayment || productLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <Spinner />
                    <p className="mt-4 text-gray-600">
                        {redirectingToPayment 
                            ? "Redirecting to payment gateway..." 
                            : productLoading 
                                ? "Loading product information..." 
                                : "Processing your order..."}
                    </p>
                </div>
            ) : !product ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-xl text-gray-600">Product not found</p>
                    <button 
                        onClick={() => navigate("/")}
                        className="mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                    >
                        Return to Home
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Product Summary */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Product Summary</h2>
                            {product ? (
                                <div className="flex items-center border-b pb-4">
                                    <img 
                                        src={product.image && product.image[0]} 
                                        alt={product.name} 
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-medium">{product.name}</h3>
                                        <p className="text-sm text-gray-500">Size: {size}</p>
                                        <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                                        <p className="font-semibold mt-1">${(product.price * quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ) : (
                                <p>No product information available</p>
                            )}
                        </div>
                        
                        {/* Delivery Information */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                            
                            {/* Saved Addresses */}
                            {loadingAddresses ? (
                                <div className="flex justify-center py-4">
                                    <Spinner />
                                </div>
                            ) : (
                                <>
                                    {userAddresses.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="font-medium mb-2">Your Addresses</h3>
                                            <div className="space-y-2">
                                                {userAddresses.map(address => (
                                                    <div 
                                                        key={address.id}
                                                        className={(
                                                            "border rounded-md p-3 cursor-pointer",
                                                            selectedAddressId === address.id 
                                                                ? "border-pink-500 bg-pink-50" 
                                                                : "border-gray-300 hover:border-pink-300"
                                                        )}
                                                        onClick={() => handleAddressSelect(address.id)}
                                                    >
                                                        <p className="font-medium">{address.phoneNumber}</p>
                                                        <p className="text-sm">{address.address}</p>
                                                        {address.postalCode && (
                                                            <p className="text-sm">Postal Code: {address.postalCode}</p>
                                                        )}
                                                        {address.isDefault && (
                                                            <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded mt-1 inline-block">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* New Address Button */}
                                    <button 
                                        className={(
                                            "w-full border border-dashed p-2 rounded-md mb-4",
                                            showNewAddressForm 
                                                ? "border-pink-500 bg-pink-50" 
                                                : "border-gray-300 hover:border-pink-300"
                                        )}
                                        onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                                    >
                                        {showNewAddressForm ? "Cancel New Address" : "+ Add New Address"}
                                    </button>
                                </>
                            )}
                            
                            {/* New Address Form */}
                            {showNewAddressForm && (
                                <div className="border border-gray-200 rounded-md p-4 mb-4">
                                    <h3 className="font-medium mb-3">New Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                            <input
                                                type="text"
                                                value={deliveryInfo.phoneNumber}
                                                onChange={(e) => handleDeliveryChange('phoneNumber', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                placeholder="Phone number"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Full Address</label>
                                            <textarea
                                                value={deliveryInfo.address}
                                                onChange={(e) => handleDeliveryChange('address', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                placeholder="Enter your complete address"
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                            <input
                                                type="text"
                                                value={deliveryInfo.postalCode}
                                                onChange={(e) => handleDeliveryChange('postalCode', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                placeholder="Postal code"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={saveNewAddress}
                                                onChange={(e) => setSaveNewAddress(e.target.checked)}
                                                className="rounded text-pink-600"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Save this address for future orders</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => setPaymentMethod("cod")}
                                        className="h-4 w-4 text-pink-600"
                                    />
                                    <span className="ml-2">Cash on Delivery (COD)</span>
                                </label>
                                
                                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="vietqr"
                                        checked={paymentMethod === "vietqr"}
                                        onChange={() => setPaymentMethod("vietqr")}
                                        className="h-4 w-4 text-pink-600"
                                    />
                                    <span className="ml-2">VietQR</span>
                                </label>
                                
                                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="vnpay"
                                        checked={paymentMethod === "vnpay"}
                                        onChange={() => setPaymentMethod("vnpay")}
                                        className="h-4 w-4 text-pink-600"
                                    />
                                    <span className="ml-2">VNPAY</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <p>Subtotal</p>
                                    <p>${subtotal.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Shipping</p>
                                    <p>$0.00</p>
                                </div>
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between font-bold">
                                        <p>Total</p>
                                        <p>${subtotal.toFixed(2)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isLoading || !product}
                                    className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 mt-4 disabled:bg-gray-400"
                                >
                                    Place Order
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 mt-2"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Payment QR Code Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Scan QR Code to Pay</h3>
                        {qrUrl ? (
                            <div className="flex flex-col items-center">
                                <img src={qrUrl} alt="Payment QR Code" className="w-64 h-64 mb-4" />
                                <p className="text-gray-600 mb-4 text-center">
                                    Scan this QR code with your banking app to pay. After payment, please upload your receipt.
                                </p>
                                <div className="space-y-3 w-full">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleUploadReceipt}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    {receiptPreview && (
                                        <div className="border rounded-md p-2 mt-2">
                                            <img 
                                                src={receiptPreview} 
                                                alt="Receipt Preview" 
                                                className="h-32 mx-auto object-contain"
                                            />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 disabled:bg-gray-400"
                                    >
                                        {uploading ? "Uploading..." : "Upload Receipt"}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/order-confirmation/${orderId}`)}
                                        className="w-full border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
                                    >

                                  </button>

                                </div>
                            </div>
                        ) : (
                            <p className="text-center py-4">Loading payment QR code...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DirectCheckOut;