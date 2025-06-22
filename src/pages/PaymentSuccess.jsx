import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import paymentService from "../services/payment";

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("success");
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");
  const message = queryParams.get("message");
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Check if payment was successful based on URL parameters
        if (!orderId && message) {
          setStatus("failure");
          setLoading(false);
          return;
        }
        
        if (orderId) {
          // For VNPAY payments, we can check the payment status from the backend
          try {
            const paymentStatus = await paymentService.checkVnpayStatus(orderId);
            if (paymentStatus && !paymentStatus.success) {
              setStatus("failure");
              toast.error(paymentStatus.message || "Payment verification failed");
            }
          } catch (err) {
            console.error("Error checking payment status:", err);
            // We don't set status to failure here because the payment might still be successful
            // even if our status check fails - the payment gateway already confirmed it
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in payment verification:", error);
        setLoading(false);
      }
    };
    
    // Give a little delay for visual feedback
    const timer = setTimeout(() => {
      checkPaymentStatus();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [orderId, message]);

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleViewOrder = () => {
    navigate("/orders");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-16 px-4">
      <div className="text-center">
        {status === "success" ? (
          <>
            <div className="rounded-full bg-green-100 p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-8">
              Your payment has been successfully processed and your order is now being prepared.
              {orderId && <span className="block mt-2">Order ID: {orderId}</span>}
            </p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-red-100 p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-8">
              {message || "There was an issue processing your payment. Please try again."}
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleContinueShopping}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded"
          >
            Continue Shopping
          </button>
          {status === "success" && (
            <button
              onClick={handleViewOrder}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded"
            >
              View Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
