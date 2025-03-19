import { useState, useRef } from "react";
import PropTypes from "prop-types";

const OTPInput = ({ onConfirm, onClose }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return; // Chỉ nhận số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[350px]">
        <h2 className="text-xl font-semibold mb-4">Nhập mã OTP</h2>
        <p className="text-gray-600 text-sm mb-4">Chúng tôi đã gửi mã OTP đến email của bạn.</p>

        <div className="flex gap-2 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              maxLength={1}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-10 h-10 text-center text-lg border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <button
          onClick={() => onConfirm(otp.join(""))}
          className="bg-blue-600 text-white px-6 py-2 rounded-md mt-4 hover:bg-blue-700"
        >
          Xác nhận
        </button>

        <button
          onClick={onClose}
          className="text-gray-600 text-sm mt-2 hover:underline block"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

OTPInput.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OTPInput;
