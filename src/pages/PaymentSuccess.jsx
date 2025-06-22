import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");
  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleViewOrder = () => {
    navigate("/orders");
  };

  return (
    <div className="max-w-2xl mx-auto my-16 px-4">
      <div className="text-center">
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

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleContinueShopping}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded"
          >
            Continue Shopping
          </button>
            <button
              onClick={handleViewOrder}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded"
            >
              View Order
            </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
