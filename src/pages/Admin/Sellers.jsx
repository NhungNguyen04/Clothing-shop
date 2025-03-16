import { useState } from "react";
import AdminLayout from "./components/AdminLayout";

const sellersData = [
  { id: 409, name: "Mary Sandra", email: "mary90@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
  { id: 478, name: "Leslie Alexander", email: "leslie@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
  { id: 171, name: "Floyd Miles", email: "fedor12@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
  { id: 222, name: "Theresa Webb", email: "theresa@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
  { id: 333, name: "Marvin McKinney", email: "marvin@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
  { id: 444, name: "Cody Fisher", email: "cody@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
  { id: 555, name: "Savannah Nguyen", email: "savannah@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
  { id: 666, name: "Ralph Edwards", email: "ralph@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
  { id: 777, name: "Jerome Bell", email: "jerome@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
  { id: 888, name: "Arlene McCoy", email: "arlene@example.com", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg" },
];

export default function SellerCard() {
  const [currentPage, setCurrentPage] = useState(1);
  const sellersPerPage = 8;

  // Tính toán số lượng trang
  const totalPages = Math.ceil(sellersData.length / sellersPerPage);
  const startIndex = (currentPage - 1) * sellersPerPage;
  const selectedSellers = sellersData.slice(startIndex, startIndex + sellersPerPage);

  return (
    <AdminLayout>
      <div className="p-6 mx-auto bg-white shadow-lg rounded-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Sellers cards</h1>
          <button className="bg-green-600 text-white px-4 py-2 rounded">+ Create new</button>
        </div>

        {/* Bộ lọc tìm kiếm */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input type="text" placeholder="Search..." className="p-2 border rounded w-full" />
          <select className="p-2 border rounded">
            <option>Show 20</option>
          </select>
          <select className="p-2 border rounded">
            <option>Status: all</option>
          </select>
        </div>

        {/* Danh sách Sellers */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {selectedSellers.map((seller) => (
            <div key={seller.id} className="bg-white shadow rounded-md overflow-hidden">
              {/* Phần nền xanh chỉ chiếm 1/2 chiều cao */}
              <div className="bg-[#08817833] h-24 w-full relative flex justify-center items-center">
                <img
                  src={seller.image}
                  alt={seller.name}
                  className="w-24 h-24 rounded-full border bg-white p-1 absolute bottom-0 translate-y-1/2"
                />
              </div>

              {/* Nội dung seller */}
              <div className="p-4 text-center mt-12">
                <h2 className="text-lg font-semibold">{seller.name}</h2>
                <p className="text-gray-500">Seller ID: #{seller.id}</p>
                <p className="text-gray-500">{seller.email}</p>
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">View details</button>
              </div>
            </div>
          ))}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <button
              className={`px-4 py-2 mx-2 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 text-white"}`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span className="px-4 py-2">{currentPage} / {totalPages}</span>
            <button
              className={`px-4 py-2 mx-2 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 text-white"}`}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
