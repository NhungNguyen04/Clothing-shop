import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const PaymentFailure = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");
  const message = queryParams.get("message") || "There was an issue processing your payment.";
  const errorCode = queryParams.get("errorCode");

  useEffect(() => {
    // Give a little delay for visual feedback
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRetryPayment = () => {
    if (orderId) {
      navigate(`/checkout?retryPayment=${orderId}`);
    } else {
      navigate("/orders");
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleContactSupport = () => {
    // You can replace this with your actual support contact method
    window.location.href = "mailto:support@clothingshop.com?subject=Payment%20Issue&body=Order%20ID:%20" + (orderId || "Not available");
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
        <p className="text-gray-600 mb-3">
          {message}
        </p>
        {errorCode && (
          <p className="text-sm text-gray-500 mb-8">
            Error code: {errorCode}
          </p>
        )}
        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Order ID: {orderId}
          </p>
        )}

        <div className="space-y-4">
          <p className="text-gray-600">
            Don't worry! Your order is saved and you can try again or choose another payment method.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button
              onClick={handleRetryPayment}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded"
            >
              Retry Payment
            </button>
            <button
              onClick={handleContinueShopping}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleContactSupport}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2 px-6 rounded"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
