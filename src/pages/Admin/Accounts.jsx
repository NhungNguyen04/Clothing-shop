import { useState, useEffect } from "react";
import { FaPlus, FaUser, FaUsers, FaUserShield, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AdminLayout from "./components/AdminLayout";
import axiosInstance from "../../api/axiosInstance";
import Spinner from "../../components/Spinner";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const AccountPage = ({ type }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/users');
        const allUsers = response.data.data;
        let filteredUsers = [];
        if (type === "seller") {
          filteredUsers = allUsers.filter(user => user.role === "SELLER");
        } else if (type === "customer") {
          filteredUsers = allUsers.filter(user => user.role === "CUSTOMER");
        } else if (type === "admin") {
          filteredUsers = allUsers.filter(user => user.role === "ADMIN");
        }
        setAccounts(filteredUsers);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load accounts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [type]);

  const handleViewDetails = (accountId) => {
    navigate(`/admin/user-profile/${accountId}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(accounts.length / itemsPerPage);
  const paginatedAccounts = accounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle page change with spinner
  const handlePageChange = (newPage) => {
    setPageLoading(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setPageLoading(false);
    }, 400);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold capitalize">{type} Accounts</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <FaPlus /> Create New
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.map((account, index) => (
                <tr key={account.id} className="border-t">
                  <td className="p-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="p-3 flex items-center gap-2">
                    {type === "seller" && <FaUser className="text-blue-500" />}
                    {type === "customer" && <FaUsers className="text-green-500" />}
                    {type === "admin" && <FaUserShield className="text-red-500" />}
                    {account.name}
                  </td>
                  <td className="p-3">{account.email}</td>
                  <td className="p-3">{new Date(account.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleViewDetails(account.id)}
                      className="bg-gray-500 text-white px-3 py-1 rounded-md"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <>
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                className="px-3 py-1 bg-green-100 rounded-md flex items-center"
                disabled={currentPage === 1 || pageLoading}
              >
                <FaChevronLeft className="text-green-700" />
              </button>
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx + 1)}
                  className={`px-3 py-1 rounded-md border ${currentPage === idx + 1 ? 'bg-green-100 text-green-700 border-green-700 font-bold' : 'bg-white text-gray-700 border-green-100'}`}
                  disabled={pageLoading}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                className="px-3 py-1 bg-green-100 rounded-md flex items-center"
                disabled={currentPage === totalPages || pageLoading}
              >
                <FaChevronRight className="text-green-700" />
              </button>
            </div>
            {pageLoading && <div className="flex justify-center mt-2"><Spinner /></div>}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AccountPage;
