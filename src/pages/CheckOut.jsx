import { useState } from "react";
import DeliveryInformation from "../components/DeliInformation"

const CheckOut = () => {
    const [paymentMethod, setPaymentMethod] = useState("razorpay");
    return (
        <div className="flex mt-4">
            <div className="w-1/2">
                <DeliveryInformation/>
            </div>
            <div className="ml-12 w-1/2">
                <div className="flex items-center">
                    <h2 className="text-lg border-b pb-2 text-[#171717]"><span className="text-[#707070]">CART</span> TOTALS</h2>
                    <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
                </div>
                <div className="flex justify-between text-gray-600 mt-2">
                    <span>Subtotal</span>
                    <span>2</span>
                </div>
                <div className="flex justify-between text-gray-600 mt-2">
                    <span>Shipping</span>
                    <span>2</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>2</span>
                </div>
                <div className="flex items-center mt-6">
                    <h2 className="text-lg border-b pb-2 text-[#171717]"><span className="text-[#707070]">PAYMENT</span> METHOD</h2>
                    <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
                </div>
                <div className="flex gap-4 mt-6">
                    <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer">
                    <input type="radio" name="payment" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} />
                    <span className="text-blue-600 font-bold">VietQR</span>
                    </label>
                    <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer">
                    <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                    <span>Cash on Delivery</span>
                    </label>
                </div>
                <button className="w-1/2 ml-auto block mt-4 text-[12px] bg-black text-white py-2 rounded hover:bg-gray-800">
                    PLACE ORDER
                </button>
            </div>
        </div>
    )
}
export default CheckOut