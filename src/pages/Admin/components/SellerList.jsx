import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../../../api/axiosInstance";
import Spinner from "../../../components/Spinner";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SellerList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/sellers');
        setSellers(response.data.sellers);
      } catch (error) {
        console.error('Error fetching sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const handleStatusChange = async (sellerId, newStatus) => {
    setSellers(sellers.map(seller => 
      seller.id === sellerId 
        ? { ...seller, isUpdatingStatus: true }
        : seller
    ));
    try {
      await axiosInstance.patch(`/sellers/${sellerId}`, { status: newStatus });
      setSellers(sellers.map(seller => 
        seller.id === sellerId 
          ? { ...seller, status: newStatus, isUpdatingStatus: false }
          : seller
      ));
    } catch (error) {
      console.error('Error updating seller status:', error);
      setSellers(sellers.map(seller => 
        seller.id === sellerId 
          ? { ...seller, isUpdatingStatus: false }
          : seller
      ));
    }
  };

  const handleViewDetails = (sellerId) => {
    navigate(`/admin/seller-profile/${sellerId}`);
  };

  // Lọc danh sách sellers
  const filteredSellers = sellers.filter(
    (seller) =>
      (seller.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
       seller.managerName?.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "All" || seller.status === statusFilter)
  );

  // Tính số trang
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const currentSellers = filteredSellers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <Spinner />;
  }

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
                <option>APPROVED</option>
                <option>PENDING</option>
                <option>REJECTED</option>
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
                        <img 
                          src={seller.user?.image || "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/people/avatar1.jpg"} 
                          alt={seller.user?.name} 
                          className="w-10 h-10 rounded-full" 
                        />
                        <div>
                            <p className="font-semibold">{seller.user?.name}</p>
                            <p className="text-sm text-gray-500">Manager: {seller.managerName}</p>
                        </div>
                        </td>
                        <td className="p-3">{seller.user?.email}</td>
                        <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                            seller.status === "APPROVED" ? "bg-green-100 text-green-600" : 
                            (seller.status === "PENDING" || !seller.status) ? "bg-gray-100 text-gray-600" :
                            "bg-red-100 text-red-600"
                        }`}>
                            {seller.status || "PENDING"}
                        </span>
                        </td>
                        <td className="p-3">{new Date(seller.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                        {(seller.status === "PENDING" || !seller.status) ? (
                          <div className="flex space-x-2">
                            {seller.isUpdatingStatus ? (
                              <div className="flex justify-center items-center w-full">
                                <div className="w-4 h-4 rounded-full bg-green-700 animate-bounce"></div>
                                <div className="w-4 h-4 rounded-full bg-green-700 animate-bounce [animation-delay:-.3s]"></div>
                                <div className="w-4 h-4 rounded-full bg-green-700 animate-bounce [animation-delay:-.5s]"></div>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleStatusChange(seller.id, "APPROVED")}
                                  className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                >
                                  <FaCheck />
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(seller.id, "REJECTED")}
                                  className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleViewDetails(seller.id)}
                            className="bg-green-700 text-white px-4 py-2 rounded-md"
                          >
                            View details
                          </button>
                        )}
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
