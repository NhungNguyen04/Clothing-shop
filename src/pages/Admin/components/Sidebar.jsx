import { useState } from "react";
import { motion } from "framer-motion";
import { FaHome, FaBox, FaShoppingCart, FaUsers, FaDollarSign, FaUser, FaStar, FaCog, FaBars } from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", icon: <FaHome />, link: "#" },
  { name: "Products", icon: <FaBox />, subMenu: ["Product Item", "Category"] },
  { name: "Orders", icon: <FaShoppingCart />, subMenu: ["Order List", "Invoice"] },
  { name: "Sellers", icon: <FaUsers />, subMenu: ["Seller List", "Seller Card"] },
  { name: "Transactions", icon: <FaDollarSign />, subMenu: [] },
  { name: "Account", icon: <FaUser />, subMenu: ["Seller Account", "Customer Account", "Admin Account"] },
  { name: "Reviews", icon: <FaStar />, link: "#" },
  { name: "Settings", icon: <FaCog />, subMenu: [] },
  { name: "Starter page", icon: <FaStar />, link: "#" },
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
        <h1 className={`text-2xl font-bold text-green-600 ${!isOpen && "hidden"}`}>Evara</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          <FaBars size={24} />
        </button>
      </div>
      <nav className="flex-1 flex flex-col justify-center mt-4">
        {menuItems.map((item, index) => (
          <div key={index} className="w-full">
            <button
              className="flex items-center p-3 w-full hover:bg-gray-200 rounded-md transition justify-start"
              onClick={() => item.subMenu && toggleMenu(item.name)}
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
              {item.subMenu && <span className="ml-auto">▼</span>}
            </button>
            {item.subMenu && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: openMenus[item.name] ? "auto" : 0, opacity: openMenus[item.name] ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-6 overflow-hidden"
              >
                {item.subMenu.map((sub, i) => (
                  <a href="#" key={i} className="block p-2 text-gray-600 hover:text-gray-800">{sub}</a>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </nav>
    </motion.div>
  );
}