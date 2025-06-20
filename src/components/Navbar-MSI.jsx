import { useContext, useState, useEffect } from 'react';
import { assets } from '@/assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setShowSearch, getCartCount } = useContext(ShopContext);
  const { user } = useAuth();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white'
    }`}>
      <div className='flex items-center justify-between py-4 px-6 font-medium relative max-w-7xl mx-auto'>
        {/* Logo */}
        <Link to="/" className="transform hover:scale-105 transition-transform duration-200">
          <img 
            src={assets.logo} 
            alt="Logo" 
            className='w-36 cursor-pointer filter hover:brightness-110 transition-all duration-200'
          />
        </Link>
        
        {/* Desktop Navigation */}
        <ul className='hidden lg:flex gap-8 text-sm text-gray-700'>
          {['HOME', 'COLLECTION', 'ABOUT', 'CONTACT'].map((item) => (
            <NavLink 
              key={item} 
              to={`/${item === "HOME" ? "" : item.toLowerCase()}`} 
              className={({ isActive }) => 
                `flex flex-col items-center gap-1 relative px-4 py-2 rounded-lg transition-all duration-300 hover:text-gray-900 hover:bg-gray-50 group ${
                  isActive ? 'text-gray-900 bg-gray-100' : ''
                }`
              }
            >
              <p className="font-medium tracking-wide">{item}</p>
              <div className="w-0 h-0.5 bg-gradient-to-r from-gray-800 to-gray-600 transition-all duration-300 group-hover:w-full"></div>
            </NavLink>
          ))}
        </ul>

        {/* Right Side Actions */}
        <div className='flex items-center gap-4'>
          {user ? (
            <>
              {/* Seller Link */}
              <Link 
                to="/seller" 
                className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg text-sm font-medium hover:from-gray-700 hover:to-gray-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span className="hidden lg:inline">Trang dành cho người bán hàng</span>
                <span className="lg:hidden">Seller</span>
              </Link>
              
              {/* User Profile Dropdown */}
              <div className="relative dropdown-container">
                <div 
                  className="w-11 h-11 rounded-full overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md transform hover:scale-105" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img
                    src={user?.image || "https://imgs.search.brave.com/_iyLNnunOEosdmlE0FgMPuvz-DPiRMSOZgzNPypuGgw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4x/Lmljb25maW5kZXIu/Y29tL2RhdGEvaWNv/bnMvdXNlci1waWN0/dXJlcy8xMDAvdW5r/bm93bi01MTIucG5n"}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Dropdown Menu */}
                <div className={`absolute right-0 top-[120%] w-52 bg-white shadow-xl rounded-xl py-3 border border-gray-100 transform transition-all duration-300 origin-top-right ${
                  dropdownOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    My Profile
                  </Link>
                  <Link 
                    to="/orders" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    Orders
                  </Link>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        localStorage.removeItem("user");
                        window.location.reload();
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <div className="w-4 h-4 bg-red-400 rounded"></div>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 hover:text-white hover:border-gray-700 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Login
            </Link>
          )}
          
          {/* Search Icon */}
          <button 
            onClick={() => setShowSearch(true)} 
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            <img src={assets.search_icon} alt="Search" className='w-5' />
          </button>
          
          {/* Cart */}
          <Link to="/cart" className="relative">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105">
              <img src={assets.cart_icon} className="w-5" alt="Cart" />
              {getCartCount() > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
                  {getCartCount()}
                </div>
              )}
            </div>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setVisible(true)} 
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <img src={assets.menu_icon} className="w-5" alt="Menu" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            visible ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={() => setVisible(false)}
        ></div>
        
        {/* Sidebar */}
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className='flex flex-col h-full'>
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-100'>
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button 
                onClick={() => setVisible(false)} 
                className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200'
              >
                <img src={assets.dropdown_icon} className="h-4 rotate-180" alt="Close" />
              </button>
            </div>
            
            {/* Navigation Links */}
            <div className="flex-1 py-4">
              {['HOME', 'COLLECTION', 'ABOUT', 'CONTACT'].map((item, index) => (
                <NavLink 
                  key={item} 
                  onClick={() => setVisible(false)} 
                  className={({ isActive }) => 
                    `flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-b border-gray-50 transition-all duration-200 ${
                      isActive ? 'bg-gray-100 text-gray-900 border-l-4 border-l-gray-800' : ''
                    }`
                  }
                  to={`/${item === "HOME" ? "" : item.toLowerCase()}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="font-medium">{item}</span>
                </NavLink>
              ))}
              
              {/* Mobile-only seller link */}
              {user && (
                <Link 
                  to="/seller" 
                  onClick={() => setVisible(false)}
                  className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-b border-gray-50 transition-all duration-200"
                >
                  <span className="font-medium">Seller Dashboard</span>
                </Link>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">© 2024 Your Store</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;