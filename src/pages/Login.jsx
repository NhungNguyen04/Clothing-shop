import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { AuthService } from "../services/oauth";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", data);
      toast.success("Đăng nhập thành công");
      
      // Use the login function from AuthContext
      await login(response.data);
      
      navigate("/");
    } catch (error) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại!");
      console.error("Login failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await AuthService.loginWithGoogle();
      
      if (!result.success) {
        toast.error(result.error || "Failed to open Google login");
        setGoogleLoading(false);
      }
      // Don't set loading to false here since we're redirecting
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google');
      setGoogleLoading(false);
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
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full border border-gray-400 py-3 rounded flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
              Redirecting to Google...
            </>
          ) : (
            <>
              <FcGoogle/>
              Login with Google
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;