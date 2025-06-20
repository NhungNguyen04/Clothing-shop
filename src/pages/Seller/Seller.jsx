import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { FaHourglassHalf, FaStore } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import axiosInstance from "../../api/axiosInstance";
import OTPInput from "../../components/OTPInput";
import useAuth from "../../hooks/useAuth";
import Sidebar from "../Admin/components/Sidebar";
import Navbar from "../../components/Navbar"; 

const Seller = () => {
  const {user} = useAuth();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    address: "",
    phoneNumber: "",
    managerName: "",
    postalCode: "",
    status: "PENDING",
  });
  const [showOTP, setShowOTP] = useState(false);

  const fetchSellerInfo = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/sellers/user/${user?.id}`);
      setSeller(response.data.seller || null);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người bán:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSellerInfo();
    }
  }, [user, fetchSellerInfo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        email: formData.email,
        addressInfo: {
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          postalCode: formData.postalCode,
        },
        managerName: formData.managerName,
        status: "PENDING",
      };

      const response = await axiosInstance.post("/sellers", payload);
      console.log("Đăng ký thành công:", response.data);
      setShowOTP(true);
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOTP = async () => {
    try {
      toast.success(
        "Yêu cầu của bạn đã gửi thành công, vui lòng chờ quản trị viên duyệt."
      );
      setShowOTP(false);
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);
      toast.error("OTP không hợp lệ, vui lòng thử lại!");
    }
  };

  // ✅ Fix: Nếu đang loading, chỉ hiển thị vòng xoay
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ImSpinner8 className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  // ✅ Nếu user đã có tài khoản seller nhưng đang chờ duyệt
  if (seller?.status === "PENDING") {
    return (
      <div className="px-4">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <FaHourglassHalf className="text-4xl text-yellow-500 mb-4" />
          <p className="text-lg font-semibold text-yellow-600 bg-yellow-100 p-4 rounded-md shadow-md">
            Tài khoản của bạn đang chờ duyệt. Vui lòng đợi quản trị viên xác nhận!
          </p>
        </div>
      </div>
    );
  }

  // ✅ Nếu user chưa đăng ký tài khoản bán hàng
  if (!seller) {
    return (
      <div className="px-4">
        <Navbar />
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
              name="phoneNumber"
              placeholder="Số điện thoại"
              value={formData.phoneNumber}
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
              className="bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ImSpinner8 className="animate-spin text-xl" />
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>
          {showOTP && (
            <OTPInput onConfirm={handleConfirmOTP} onClose={() => setShowOTP(false)} />
          )}
        </div>
      </div>
    );
  }

  // ✅ Nếu seller.status === "APPROVED" -> Render trang quản lý bán hàng
  return (
    <div className="flex w-screen h-screen">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FaStore className="text-6xl text-gray-700 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800">Trang quản lý bán hàng</h1>
          <p className="text-lg text-gray-600 mt-2">
            Quản lý sản phẩm, đơn hàng và nhiều hơn nữa!
          </p>
        </div>
      </main>
    </div>
  );
};

export default Seller;
