import { useState } from "react";
import { FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 6;

// eslint-disable-next-line react/prop-types
export default function ProductTable({ data, setIsOpen, setInitialData, onDelete }) {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line react/prop-types
  const formattedProducts = data.length > 0 && data.map((item) => ({
    id: item.id,
    name: item.name,
    price: `$${item.price.toFixed(2)}`,
    category: item.category,
    subCategory: item.subCategory,
    stockSize: item.stockSize,
    status: item.stockQuantity > 0 ? "Active" : "Out of Stock",
    date: new Date(item.createdAt).toLocaleDateString(),
    image: item.image,
    description: item.description,
  }));

  const handleEdit = (data) => {
    setIsOpen(true)
    setDropdownOpen(false)
    setInitialData(data)
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) return;
    try {
      await axiosInstance.delete(`/products/${product.id}`);
      toast.success("Xóa sản phẩm thành công!", { position: "top-right" });
      if (onDelete) onDelete(product.id);
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại!", { position: "top-right" });
      console.error(error);
    }
  };

  const totalPages = Math.ceil(formattedProducts.length / ITEMS_PER_PAGE);
  const currentProducts = formattedProducts.length > 0 && formattedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-4">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Date Created</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {currentProducts.length > 0 && currentProducts.map((product, index) => (
              <motion.tr
                key={product.id}
                className="border-b hover:bg-gray-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td className="p-3 flex items-center w-[250px]">
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="w-[50px] h-[50px] rounded mr-3"
                  />
                  <span className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap" style={{ maxWidth: '180px' }}>
                    {product.name}
                  </span>
                </td>
                <td className="p-3">{product.price}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      product.status === "Active"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="p-3">{product.date}</td>
                <td className="p-3 text-center relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-200 relative z-10"
                    onClick={() =>
                      setDropdownOpen(dropdownOpen === product.id ? null : product.id)
                    }
                  >
                    <FaEllipsisV />
                  </button>
                  {dropdownOpen === product.id && (
                    <div className="absolute right-5 bg-white border border-gray-200 shadow-md rounded-lg w-32 z-20">
                      <button onClick={() => handleEdit(product)} className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left">
                        <FaEdit className="mr-2 text-blue-500" /> Edit
                      </button>
                      <button onClick={() => handleDelete(product)} className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600">
                        <FaTrash className="mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 min-h-[64px]">
        {totalPages > 1 && (
          <>
            <button
              className={`px-4 py-2 mx-1 border rounded ${
                currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"
              }`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="px-4 py-2 mx-1 border rounded bg-gray-100">
              {currentPage} / {totalPages}
            </span>
            <button
              className={`px-4 py-2 mx-1 border rounded ${
                currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"
              }`}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}
