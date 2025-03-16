import { useState } from "react";
import AdminLayout from "./AdminLayout";

const sellersData = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: `Seller ${i + 1}`,
  email: `seller${i + 1}@example.com`,
  status: i % 2 === 0 ? "Active" : "Inactive",
  registered: `0${(i % 9) + 1}.07.2022`,
  image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg",
}));

export default function SellerList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Lọc danh sách sellers
  const filteredSellers = sellersData.filter(
    (seller) =>
      seller.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "All" || seller.status === statusFilter)
  );

  // Tính số trang
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const currentSellers = filteredSellers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
        <div className="mx-auto p-6 bg-white shadow-md rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Sellers list</h1>
                <button className="bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
                + Create new
                </button>
            </div>

            {/* Bộ lọc */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                type="text"
                placeholder="Search..."
                className="border p-2 rounded w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
                <select
                className="border p-2 rounded"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
                </select>
            </div>

            {/* Bảng danh sách */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-left">
                    <th className="p-3">Seller</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Registered</th>
                    <th className="p-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentSellers.map((seller) => (
                    <tr key={seller.id} className="border-t">
                        <td className="p-3 flex items-center space-x-3">
                        <img src={seller.image} alt={seller.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-semibold">{seller.name}</p>
                            <p className="text-sm text-gray-500">Seller ID: #{seller.id}</p>
                        </div>
                        </td>
                        <td className="p-3">{seller.email}</td>
                        <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                            seller.status === "Active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                            {seller.status}
                        </span>
                        </td>
                        <td className="p-3">{seller.registered}</td>
                        <td className="p-3">
                        <button className="bg-green-700 text-white px-4 py-2 rounded-md">View details</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3 py-1 bg-gray-200 rounded-md"
                    disabled={currentPage === 1}
                >
                    &larr; Back
                </button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded-md ${
                        currentPage === index + 1 ? "bg-green-700 text-white" : "bg-gray-200"
                    }`}
                    >
                    {index + 1}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1 bg-gray-200 rounded-md"
                    disabled={currentPage === totalPages}
                >
                    Next &rarr;
                </button>
                </div>
            )}
            </div>
    </AdminLayout>
  );
}
