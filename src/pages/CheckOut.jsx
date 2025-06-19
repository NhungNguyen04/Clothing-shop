import { useContext, useEffect, useState, useRef } from "react";
import DeliveryInformation from "../components/DeliInformation";
import { ShopContext } from "../context/ShopContext";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

const CheckOut = () => {
    const { cartId } = useParams();
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCart, setLoadingCart] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("razorpay");
    const {user} = useAuth();
    const [deliveryInfo, setDeliveryInfo] = useState({
        email: "",
        phoneNumber: "",
        address: "",
        street: "",
        postalCode: ""
    });
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState("");
    const [receiptUrl, setReceiptUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [orderId, setOrderId] = useState("");
    const fileInputRef = useRef();
    const [receiptPreview, setReceiptPreview] = useState("");

    useEffect(() => {
        if(!cartId) return;
        setLoadingCart(true);
        const fetchCart = async () => {
            try {
                const response = await axiosInstance.get(`/cart/${user?.id}`);
                setCart(response.data.cartItems || []);
                const subtotal = (response.data.cartItems || []).reduce((sum, item) => sum + Number(item.totalPrice), 0);
                setCartTotal(subtotal);
            } catch (error) {
                setCart([]);
                setCartTotal(0);
                console.error('Error fetching cart:', error);
            } finally {
                setLoadingCart(false);
            }
        };
        fetchCart();
    }, [user?.id]);

    const handlePlaceOrder = async () => {
        try {
            setIsLoading(true);
            const selectedCartItemIds = cart.map(item => item.id);
            const orderRes = await axiosInstance.post('/orders/from-cart', {
                cartId,
                userId: user.id,
                phoneNumber: deliveryInfo.phoneNumber,
                address: deliveryInfo.address,
                postalCode: deliveryInfo.postalCode,
                paymentMethod: paymentMethod === 'cod' ? 'COD' : 'VIETQR',
                selectedCartItemIds
            });
            setOrderId(orderRes.data.data?.id || "");
            if (paymentMethod === 'cod') {
                toast.success('Order placed successfully!');
                setTimeout(() => {
                    setIsLoading(false);
                    navigate('/order-success');
                }, 1200);
            } else {
                handleOpenQR();
                setIsLoading(false);
            }
        } catch (error) {
            console.log(error)
            setIsLoading(false);
        }
    };

    const handleDeliveryChange = (name, value) => {
        setDeliveryInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleOpenQR = () => {
        const amount = cartTotal + 10;
        const url = `https://img.vietqr.io/image/970403-070126475657-print.png?amount=${amount}&addInfo=Thanh toán cho Shop Forever&accountName=SHOP%20FOREVER`;
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
            if (orderId) {
                await axiosInstance.post('/transaction', {
                    orderId,
                    amount: cartTotal + 10,
                    status: 'PENDING',
                    image: res.data.data
                });
                setShowQR(false);
                setPaymentMethod('cod');
                toast.success('Đã gửi biên lai, chờ xác nhận!');
                setTimeout(() => {
                    navigate('/order-success');
                }, 1200);
            }
        } catch (err) {
            toast.error('Upload thất bại!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex mt-4">
            {loadingCart && <Spinner />}
            <div className="w-1/2">
            <DeliveryInformation
                deliveryInfo={deliveryInfo}
                onDeliveryChange={handleDeliveryChange}
            />
            <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Postal Code</label>
                <input
                    type="text"
                    className="border rounded px-3 py-2 w-full"
                    value={deliveryInfo.postalCode}
                    onChange={e => handleDeliveryChange('postalCode', e.target.value)}
                />
            </div>
            </div>
            <div className="ml-12 w-1/2">
                <div>
                  {cart.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between border-b py-4">
                      <img src={item.sizeStock?.product?.image?.[0]} alt={item.sizeStock?.product?.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 ml-4">
                        <p className="text-[14px] text-[#494949]">{item.sizeStock?.product?.name}</p>
                        <div className="flex items-center mt-2 gap-8">
                          <span>Size: <b>{item.sizeStock?.size}</b></span>
                          <span>Price: <b>${Number(item.sizeStock?.product?.price).toFixed(2)}</b></span>
                          <span>Quantity: <b>{item.quantity}</b></span>
                          <span>Total: <b>${Number(item.totalPrice).toFixed(2)}</b></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                    <div className="flex items-center mt-6">
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
                        <span>$10</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total</span>
                        <span>${(cartTotal + 10).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center mt-6">
                        <h2 className="text-lg border-b pb-2 text-[#171717]">
                            <span className="text-[#707070]">PAYMENT</span> METHOD
                        </h2>
                        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === "vietqr"}
                                onChange={() => {
                                    setPaymentMethod("vietqr");
                                    handleOpenQR();
                                }}
                            />
                            <span className="text-blue-600 font-bold">VietQR</span>
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
                    </div>
                    <button
                        className="w-1/2 ml-auto block mt-4 text-[12px] bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-500"
                        onClick={handlePlaceOrder}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "PLACE ORDER"}
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
                        {uploading && <div className="mt-2 text-blue-600">Đang upload...</div>}
                        {receiptUrl && <div className="mt-2 text-green-600">Đã upload biên lai!</div>}
                        <button onClick={() => setShowQR(false)} className="mt-4 text-gray-600">Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckOut;
