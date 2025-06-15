import { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Spinner from "../../components/Spinner";

const PRODUCTS_PER_PAGE = 8;

const SellerProfile = () => {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/sellers/${id}`);
        setSellerData(response.data.seller);
      } catch (err) {
        console.error("Error fetching seller:", err);
        setError("Failed to load seller information.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSeller();
    }
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!sellerData) {
    return <div className="text-center text-gray-500 mt-10">No seller data found.</div>;
  }

  const totalPages = Math.ceil(sellerData.products.length / PRODUCTS_PER_PAGE);

  const currentProducts = sellerData.products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <AdminLayout>
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="bg-white shadow-lg rounded-lg mx-auto">
          <div className="relative bg-blue-600 h-36 flex justify-center items-center">
            <img
              src={sellerData.user?.image || "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/brands/brand-3.jpg"}
              alt="Logo"
              className="absolute bottom-[-40px] w-24 h-24 rounded-lg shadow-lg"
            />
          </div>
          <div className="pt-16 text-center">
            <h1 className="text-2xl font-bold">{sellerData.user?.name || sellerData.managerName}</h1>
            <p className="text-gray-600">{sellerData.address?.address || "Address not available"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Total products:</p>
              <p className="text-lg font-bold text-green-700">{sellerData.products.length}</p>
              <p className="text-sm text-gray-600 mt-2">Status:</p>
              <p className="text-lg font-bold text-green-700">{sellerData.status}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-md font-semibold">Contacts</p>
              <p className="text-gray-700">Manager: {sellerData.managerName}</p>
              <p className="text-blue-600">{sellerData.user?.email}</p>
              <p className="text-gray-700">{sellerData.address?.phoneNumber || "Phone number not available"}</p>
            </div>
            <div className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p className="text-md font-semibold">Address</p>
                <p className="text-gray-700">Country: {sellerData.address?.province || "N/A"}</p>
                <p className="text-gray-700">Address: {sellerData.address?.street || "N/A"}</p>
                <p className="text-gray-700">Postal code: {sellerData.address?.postalCode || "N/A"}</p>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold px-6 mt-6">Products by seller</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-md flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              >
                <img src={product.image[0]} alt={product.name} className="w-fit object-cover" />
                <h3 className="mt-2 text-lg font-medium text-center px-2">{product.name}</h3>
                <p className="text-gray-700">${product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 py-6">
              <button
                className={`px-4 py-2 border rounded ${
                  currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-white hover:bg-gray-200"
                }`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 border rounded ${
                    currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200"
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className={`px-4 py-2 border rounded ${
                  currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-white hover:bg-gray-200"
                }`}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SellerProfile;
