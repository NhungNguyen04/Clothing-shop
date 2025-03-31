import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axiosInstance from "../api/axiosInstance";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", data);
      toast.success("Đăng nhập thành công");
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
      window.location.reload()
    } catch (error) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại!");
      console.error("Login failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 min-h-screen">
      <h2 className="text-2xl text-[#414141] font-bold mb-6">Login <span className="text-gray-700">—</span></h2>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
        <input 
          type="email" 
          placeholder="Email" 
          {...register("email", { required: "Email is required" })} 
          className="w-full border border-gray-400 p-3 rounded mb-2" 
        />
        {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>}

        <input 
          type="password" 
          placeholder="Password" 
          {...register("password", { required: "Password is required" })} 
          className="w-full border border-gray-400 p-3 rounded mb-2" 
        />
        {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>}

        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <a href="#" className="hover:underline">Forgot your password?</a>
          <a href="/register" className="hover:underline">Create account</a>
        </div>

        <button type="submit" className="w-full bg-black text-white py-3 rounded mb-4" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <button className="w-full border border-gray-400 py-3 rounded flex items-center justify-center gap-2">
          <FcGoogle/>
          Login with Google
        </button>
      </form>
    </div>
  );
};

export default Login;