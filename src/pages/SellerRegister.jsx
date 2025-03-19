import { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import OTPInput from "../components/OTPInput";
import useAuth from "../hooks/useAuth";

const SellerRegister = () => {
  const user = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    address: "",
    phone: "",
    managerName: "",
    postalCode: "",
    status: 'PENDING'
  });


  const [showOTP, setShowOTP] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axiosInstance.post("/sellers", {...formData, userId: user?.id});
      console.log("Đăng ký thành công:", response.data);
      setShowOTP(true);
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleConfirmOTP = async () => {
    try {
      toast.success("Yêu cầu của bạn đã gửi thành công, vui lòng chờ quản trị viên duyệt.");
      setShowOTP(false);
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);
      toast.error("OTP không hợp lệ, vui lòng thử lại!");
    }
  };

  return (
    <div className="max-w-lg mx-auto my-10 p-8 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Đăng ký trở thành người bán hàng
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded-md"
          required
        />

        <input
          type="text"
          name="address"
          placeholder="Địa chỉ"
          value={formData.address}
          onChange={handleChange}
          className="border p-2 rounded-md"
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Số điện thoại"
          value={formData.phone}
          onChange={handleChange}
          className="border p-2 rounded-md"
          required
        />

        <input
          type="text"
          name="managerName"
          placeholder="Tên quản lý"
          value={formData.managerName}
          onChange={handleChange}
          className="border p-2 rounded-md"
          required
        />

        <input
          type="text"
          name="postalCode"
          placeholder="Mã bưu chính"
          value={formData.postalCode}
          onChange={handleChange}
          className="border p-2 rounded-md"
          required
        />

        <button
          type="submit"
          className="bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700"
        >
          Đăng ký
        </button>
      </form>

      {showOTP && <OTPInput onConfirm={handleConfirmOTP} onClose={() => setShowOTP(false)} />}
    </div>
  );
};

export default SellerRegister;
