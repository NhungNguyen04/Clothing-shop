import { useState } from "react";
import { FaSearch, FaBell, FaMoon, FaRss, FaGlobe, FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between bg-white shadow-md p-4 relative">
      {/* Search Bar */}
      <div className="flex items-center border rounded-md bg-gray-100 overflow-hidden">
        <input
          type="text"
          placeholder="Search term"
          className="p-2 bg-transparent outline-none"
        />
        <button className="p-2 text-gray-500">
          <FaSearch />
        </button>
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <FaBell className="text-gray-500 cursor-pointer" />
          <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-1 rounded-full">3</span>
        </div>
        <FaMoon className="text-gray-500 cursor-pointer" />
        <FaRss className="text-gray-500 cursor-pointer" />
        <FaGlobe className="text-gray-500 cursor-pointer" />

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden focus:outline-none"
          >
            <img 
              src={user?.image || "https://via.placeholder.com/40"} 
              alt="User Avatar" 
              className="w-full h-full" 
            />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
              <button className="w-full flex items-center px-4 py-2 hover:bg-gray-100">
                <FaUserEdit className="mr-2 text-gray-600" />
                Edit Profile
              </button>
              <button 
                onClick={() => { 
                  logout();
                  navigate('/login');
                  window.location.reload()
                }}
                className="w-full flex items-center px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
