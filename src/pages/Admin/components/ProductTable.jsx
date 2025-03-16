import { useState } from "react";
import { FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";

const products = [
  { id: 1, name: "T-shirt for men medium size", price: "$34.50", status: "Active", date: "02.11.2022", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/1.jpg" },
  { id: 2, name: "Helionic Hooded Down Jacket", price: "$990.99", status: "Active", date: "02.11.2022", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/1.jpg" },
  { id: 3, name: "Lace mini dress with faux leather", price: "$76.99", status: "Archived", date: "02.11.2022", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/1.jpg" },
  { id: 4, name: "Fanmis Men's Travel Bag", price: "$18.00", status: "Active", date: "02.11.2022", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/1.jpg" },
  { id: 5, name: "Casual Denim Jacket", price: "$120.00", status: "Active", date: "03.11.2022", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/1.jpg" },
  { id: 6, name: "Summer Cotton Dress", price: "$45.99", status: "Archived", date: "03.11.2022", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/1.jpg" },
  { id: 7, name: "Men's Leather Wallet", price: "$29.99", status: "Active", date: "04.11.2022", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/1.jpg" },
  { id: 8, name: "Women's Handbag", price: "$150.00", status: "Active", date: "04.11.2022", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/1.jpg" },
];

const ITEMS_PER_PAGE = 6;

export default function ProductTable() {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentProducts = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto p-4">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Date Created</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-50">
              <td className="p-3 flex items-center">
                <img src={product.image} alt={product.name} className="w-[50px] h-[50px] rounded mr-3" />
                {product.name}
              </td>
              <td className="p-3">{product.price}</td>
              <td className="p-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    product.status === "Active" ? "bg-green-200 text-green-800" : "bg-orange-200 text-orange-800"
                  }`}
                >
                  {product.status}
                </span>
              </td>
              <td className="p-3">{product.date}</td>
              <td className="p-3 text-center relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-200 relative z-10"
                  onClick={() => setDropdownOpen(dropdownOpen === product.id ? null : product.id)}
                >
                  <FaEllipsisV />
                </button>
                {dropdownOpen === product.id && (
                  <div className="absolute right-5 bg-white border border-gray-200 shadow-md rounded-lg w-32 z-20">
                    <button className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left">
                      <FaEdit className="mr-2 text-blue-500" /> Edit
                    </button>
                    <button className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600">
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls - luôn giữ nguyên chiều cao */}
      <div className="flex justify-center items-center mt-4 min-h-[64px]">
        {totalPages > 1 && (
          <>
            <button
              className={`px-4 py-2 mx-1 border rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"}`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="px-4 py-2 mx-1 border rounded bg-gray-100">{currentPage} / {totalPages}</span>
            <button
              className={`px-4 py-2 mx-1 border rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"}`}
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
