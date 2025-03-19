import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/users", data);
      toast.success("Đăng ký tài khoản thành công");
      console.log("Registration successful:", response.data.data);
    } catch (error) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại!");
      console.error("Registration failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 min-h-screen">
      <h2 className="text-2xl text-[#414141] font-bold mb-6">Register <span className="text-gray-700">—</span></h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
        <input 
          type="text" 
          placeholder="Name" 
          {...register("name", { required: "Name is required" })} 
          className="w-full border border-gray-400 p-3 rounded mb-2" 
        />
        {errors.name && <p className="text-red-500 text-sm mb-2">{errors.name.message}</p>}
        
        <input 
          type="email" 
          placeholder="Email" 
          {...register("email", { required: "Email is required", pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Invalid email address" } })} 
          className="w-full border border-gray-400 p-3 rounded mb-2" 
        />
        {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>}
        
        <input 
          type="password" 
          placeholder="Password" 
          {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} 
          className="w-full border border-gray-400 p-3 rounded mb-2" 
        />
        {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>}

        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>Already have an account? <a href="/login" className="hover:underline">Login</a></span>
        </div>
        
        <button type="submit" className="w-full bg-black text-white py-3 rounded" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
};

export default Register;
