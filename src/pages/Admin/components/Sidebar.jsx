import { useState } from "react";
import { motion } from "framer-motion";
import { FaHome, FaBox, FaShoppingCart, FaUsers, FaDollarSign, FaUser, FaStar, FaCog, FaBars } from "react-icons/fa";
import { assets } from '@/assets/assets';
import { Link } from 'react-router-dom';

const menuItems = [
  { name: "Dashboard", icon: <FaHome />, link: "/admin/dashboard" },
  { name: "Products", icon: <FaBox />, subMenu: [
      { name: "Product Items", link: "/admin/products" },
      { name: "Category", link: "/admin/category" }
    ] },
  { name: "Orders", icon: <FaShoppingCart />, subMenu: [
      { name: "Order List", link: "/admin/order-list" },
      { name: "Invoice", link: "/admin/invoice" }
    ] },
  { name: "Sellers", icon: <FaUsers />, subMenu: [
      { name: "Seller List", link: "/admin/seller-list" },
      { name: "Seller Card", link: "/admin/seller-card" }
    ] },
  { name: "Transactions", icon: <FaDollarSign />, link: "/admin/transactions" },
  { name: "Account", icon: <FaUser />, subMenu: [
      { name: "Seller Account", link: "/admin/account" },
      { name: "Customer Account", link: "/admin/account" },
      { name: "Admin Account", link: "/admin/account" }
    ] },
  { name: "Reviews", icon: <FaStar />, link: "/admin/review" },
  { name: "Settings", icon: <FaCog />, link: "/admin/settings" },
  { name: "Starter Page", icon: <FaStar />, link: "/admin/starter-page" }
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  return (
    <motion.div 
      initial={{ width: "16rem" }} 
      animate={{ width: isOpen ? "16rem" : "4rem" }} 
      transition={{ duration: 0.3 }}
      className="h-screen bg-white shadow-md flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between p-4">
        <img src={assets.logo} alt="Logo" className='w-36 cursor-pointer'/>
        <button onClick={() => setIsOpen(!isOpen)}>
          <FaBars size={24} />
        </button>
      </div>
      <nav className="flex-1 flex flex-col justify-center mt-4">
        {menuItems.map((item, index) => (
          <div key={index} className="w-full">
            {item.subMenu ? (
              <>
                <button
                  className="flex items-center p-3 w-full hover:bg-gray-200 rounded-md transition justify-start"
                  onClick={() => toggleMenu(item.name)}
                >
                  <span className="text-gray-600">{item.icon}</span>
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
                    transition={{ duration: 0.2 }}
                    className={`ml-3 text-gray-800 ${!isOpen && "hidden"}`}
                  >
                    {item.name}
                  </motion.span>
                  <span className="ml-auto">▼</span>
                </button>
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: openMenus[item.name] ? "auto" : 0, opacity: openMenus[item.name] ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-6 overflow-hidden"
                >
                  {item.subMenu.map((sub, i) => (
                    <Link to={sub.link} key={i} className="block p-2 text-gray-600 hover:text-gray-800">{sub.name}</Link>
                  ))}
                </motion.div>
              </>
            ) : (
              <Link to={item.link} className="flex items-center p-3 w-full hover:bg-gray-200 rounded-md transition justify-start">
                <span className="text-gray-600">{item.icon}</span>
                <motion.span 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
                  transition={{ duration: 0.2 }}
                  className={`ml-3 text-gray-800 ${!isOpen && "hidden"}`}
                >
                  {item.name}
                </motion.span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </motion.div>
  );
}
