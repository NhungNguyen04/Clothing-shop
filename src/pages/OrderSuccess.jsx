import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <img
        src="https://cdn-icons-png.flaticon.com/512/845/845646.png"
        alt="Order Success"
        className="w-24 h-24 mb-6"
      />
      <h1 className="text-3xl font-bold mb-4 text-green-600">Đặt hàng thành công!</h1>
      <p className="mb-6 text-lg">Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi.<br/>Đơn hàng của bạn đã được ghi nhận và sẽ sớm được xử lý, vui lòng kiểm tra email để xác nhận đơn hàng.</p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Quay về trang chủ
      </button>
    </div>
  );
};

export default OrderSuccess; 