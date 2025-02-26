import { FcGoogle } from "react-icons/fc";
const Login = () => {
  return (
    <div className="flex flex-col items-center mt-6 min-h-screen">
        <h2 className="text-2xl text-[#414141] font-bold mb-6">Login <span className="text-gray-700">—</span></h2>
      <div className="w-full max-w-sm">
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full border border-gray-400 p-3 rounded mb-4" 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full border border-gray-400 p-3 rounded mb-4" 
        />
        
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <a href="#" className="hover:underline">Forgot your password?</a>
          <a href="/register" className="hover:underline">Create account</a>
        </div>
        
        <button className="w-full bg-black text-white py-3 rounded mb-4">Sign in</button>
        <button className="w-full border border-gray-400 py-3 rounded flex items-center justify-center gap-2">
          <FcGoogle/>
          Login with Google
        </button>
      </div>
    </div>
  )
}

export default Login
