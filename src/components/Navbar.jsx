import { useContext, useState } from 'react';
import { assets } from '@/assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { setShowSearch, getCartCount } = useContext(ShopContext);
  const { user, logout, isSeller, isAdmin } = useAuth();
  
  return (
    <div className='flex items-center justify-between py-5 font-medium relative'>
      <Link to="/">
        <img src={assets.logo} alt="Logo" className='w-36 cursor-pointer'/>
      </Link>
      
      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        {['HOME', 'COLLECTION', 'ABOUT', 'CONTACT'].map((item) => (
          <NavLink key={item} to={`/${item === "HOME" ? "" : item.toLowerCase()}`} className="flex flex-col items-center gap-1">
            <p>{item}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
          </NavLink>
        ))}
      </ul>

      <div className='flex items-center gap-6'>
        {user ? (
          <>
            {isSeller && (
              <Link to="/seller" className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700">
                Trang dành cho người bán hàng
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/admin/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Admin Dashboard
              </Link>
            )}
            
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border border-gray-300" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <img
                  src={user?.image || "https://imgs.search.brave.com/_iyLNnunOEosdmlE0FgMPuvz-DPiRMSOZgzNPypuGgw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4x/Lmljb25maW5kZXIu/Y29tL2RhdGEvaWNv/bnMvdXNlci1waWN0/dXJlcy8xMDAvdW5r/bm93bi01MTIucG5n"}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              {dropdownOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[110%] w-48 bg-white shadow-lg rounded-md py-2 z-50 border border-gray-200">
                  <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Orders</Link>
                  <button
                    onClick={() => {
                      logout(); // Use the logout function from AuthContext
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="text-sm text-gray-700">
            LOGIN
          </Link>
        )}
        
        <div className='cursor-pointer relative' onClick={() => setShowSearch(true)}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        
        <Link to="/cart" className='cursor-pointer relative'>
          <i className="fa-solid fa-cart-shopping"></i>
          {getCartCount() > 0 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <p className="text-white text-xs">{getCartCount()}</p>
            </div>
          )}
        </Link>
        
        <div className='sm:hidden cursor-pointer' onClick={() => setVisible(!visible)}>
          <i className="fa-solid fa-bars"></i>
        </div>
      </div>
      
      {visible && (
        <div className='sm:hidden absolute left-0 top-full w-full bg-white shadow-md z-40 p-4'>
          <ul className='flex flex-col gap-2'>
            {['HOME', 'COLLECTION', 'ABOUT', 'CONTACT'].map((item) => (
              <NavLink key={item} to={`/${item === "HOME" ? "" : item.toLowerCase()}`} className="text-gray-700 py-2" onClick={() => setVisible(false)}>
                {item}
              </NavLink>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
