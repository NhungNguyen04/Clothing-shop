const Register = () => {
  return (
    <div className="flex flex-col items-center mt-6 min-h-screen">
      <h2 className="text-2xl text-[#414141] font-bold mb-6">Register <span className="text-gray-700">—</span></h2>
      
      <div className="w-full max-w-sm">
        <input 
          type="text" 
          placeholder="Name" 
          className="w-full border border-gray-400 p-3 rounded mb-4" 
        />
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
          <span>Already have an account? <a href="/login" className="hover:underline">Login</a></span>
        </div>
        <button className="w-full bg-black text-white py-3 rounded mb-4">Create</button>
      </div>
    </div>
  )
}

export default Register
