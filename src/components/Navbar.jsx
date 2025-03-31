import { useContext, useState } from 'react';
import { assets } from '@/assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { setShowSearch, getCartCount } = useContext(ShopContext);
  const user = useAuth();

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
            <Link to="/seller" className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700">
              Trang dành cho người bán hàng
            </Link>
            
            <div className="relative">
              <img
                src={user?.avatar || assets.default_avatar}
                alt="User Avatar"
                className="w-12 h-12 rounded-full cursor-pointer border border-gray-300"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[110%] w-48 bg-white shadow-lg rounded-md py-2 z-50 border border-gray-200">
                  <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Orders</Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      window.location.reload();
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="px-4 py-2 border border-[#e5e7eb] text-black rounded-md text-sm hover:bg-gray-600 hover:text-white">
            Login
          </Link>
        )}
        
        <img onClick={() => setShowSearch(true)} src={assets.search_icon} alt="Search" className='w-5 cursor-pointer' />
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 cursor-pointer" alt="Cart" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        <img onClick={() => setVisible(true)} src={assets.menu_icon} className="w-5 cursor-pointer" alt="Menu" />
      </div>

      {/* Sidebar menu for smaller screens */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-2'>
            <img src={assets.dropdown_icon} className="h-4 rotate-180" alt="Back" />
            <p>Back</p>
          </div>
          {['HOME', 'COLLECTION', 'ABOUT', 'CONTACT'].map((item) => (
            <NavLink key={item} onClick={() => setVisible(false)} className="py-2 pl-6 border" to={`/${item.toLowerCase()}`}>{item}</NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
