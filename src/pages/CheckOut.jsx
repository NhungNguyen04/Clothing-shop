import { useContext, useEffect, useState } from "react";
import DeliveryInformation from "../components/DeliInformation";
import { ShopContext } from "../context/ShopContext";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import { useParams, useSearchParams } from "react-router-dom";
const CheckOut = () => {
    const { productId } = useParams();
    const [searchParams] = useSearchParams();

    const size = searchParams.get('size');
    const quantity = searchParams.get('quantity');

    const [paymentMethod, setPaymentMethod] = useState("razorpay");
    const [cart, setCart] = useState([]);
    const [singleProduct, setSingleProduct] = useState(null);
    const { cartTotal, setCartTotal } = useContext(ShopContext);
    const [isLoading, setIsLoading] = useState(false);
    const user = useAuth()
    const [deliveryInfo, setDeliveryInfo] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
        street: ""
    });

    useEffect(() => {
        if (productId) {
            const fetchSingleProduct = async () => {
                try {
                    const response = await axiosInstance.get(`/products/${productId}`);
                    setSingleProduct(response.data.data);
                    setCartTotal(response.data.data.price * quantity)
                } catch (error) {
                    console.log(error)
                }
            }
            fetchSingleProduct();
        }
    }, [productId])

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
        const transformedCart = Object.keys(storedCart).flatMap(productId =>
            storedCart[productId].map(item => ({
                productId,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                sellerId: item.sellerId
            }))
        );
        setCart(transformedCart)
        
    }, [])
    

    const handlePlaceOrder = async () => {
        try {
            setIsLoading(true);
            for (let i = 0; i < cart.length; i++) {
                await axiosInstance.post('/orders', {
                    customerName: deliveryInfo.name, 
                    address: deliveryInfo.address,
                    phoneNumber: deliveryInfo.phoneNumber,
                    totalPrice: parseFloat(cartTotal), 
                    userId: user.id,
                    status: 'PENDING',    
                    productId: cart[i].productId,
                    quantity: cart[i].quantity,
                    price: cart[i].price,
                    sellerId: cart[i].sellerId,
                    size: cart[i].size  
                })
            }
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);
        } catch (error) {
            console.log(error)
        }
    };

    const handleDeliveryChange = (name, value) => {
        setDeliveryInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    return (
        <div className="flex mt-4">
            <div className="w-1/2">
            <DeliveryInformation
                deliveryInfo={deliveryInfo}
                onDeliveryChange={handleDeliveryChange}
            />
            </div>
            <div className="ml-12 w-1/2">
                <div
                    className="flex items-center justify-between border-b py-4"
                    >
                    <img src={singleProduct?.image[0]} alt={singleProduct?.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 ml-4">
                        <p className="text-[14px] text-[#494949]">{singleProduct?.name}</p>
                        <div className="flex items-center mt-2">
                        <p className="text-[#494949]">${singleProduct?.price}</p>
                        <p className="text-sm bg-[#FBFBFB] border border-[#DFDFDF] inline-block px-3 py-1 rounded ml-4">
                            {size}
                        </p>
                        </div>
                    </div>
                    <p
                        className="border p-1 text-center rounded"
                    >
                        Quantity: {quantity}
                    </p>
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
                        <span>{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mt-2">
                        <span>Shipping</span>
                        <span>$10</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total</span>
                        <span>${cartTotal + 10}</span>
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
                                checked={paymentMethod === "stripe"}
                                onChange={() => setPaymentMethod("stripe")}
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
        </div>
    );
};

export default CheckOut;
