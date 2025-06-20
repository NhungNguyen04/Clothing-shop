import { useState, useEffect, useCallback } from "react";
import { FaEdit, FaEllipsisV, FaTrash } from "react-icons/fa";
import AdminLayout from "./components/AdminLayout";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";
import { motion } from "framer-motion";
import Spinner from "../../components/Spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const statusColors = {
  "PENDING": "bg-orange-100 text-orange-700",
  "SHIPPED": "bg-blue-100 text-blue-700",
  "DELIVERED": "bg-green-100 text-green-700",
  "CANCELLED": "bg-red-100 text-red-700",
};

const statusList = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrderList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCount, setShowCount] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.ceil(orders.length / pageSize);
  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.1 },
    }),
  };

  const getList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/orders/seller/${user?.idSeller}`);
      const ordersData = response.data.data;
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.idSeller]);

  useEffect(() => {
    if (user?.idSeller) {
      getList();
    }
  }, [user?.idSeller, getList]);

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (newStatus, orderId) => {
    try {
      setStatusLoadingId(orderId);
      const response = await axiosInstance.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (response.data && response.data.message) {
        toast.info(response.data.message, { position: "top-right" });
      }
      await getList();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message, { position: "top-right" });
      } else {
        toast.error("Error updating status!", { position: "top-right" });
      }
      console.error("Error updating status:", error);
    } finally {
      setStatusLoadingId(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-semibold">Order List</h1>
        <p className="text-gray-500">Lorem ipsum dolor sit amet.</p>

        <div className="bg-white p-4 rounded-lg shadow-md mt-4 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search..."
            className="w-full sm:w-1/3 p-2 border rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            {statusList.map(status => (
              <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>
            ))}
          </select>

          <select
            className="p-2 border rounded-md"
            value={showCount}
            onChange={(e) => setShowCount(Number(e.target.value))}
          >
            <option value="10">Show 10</option>
            <option value="20">Show 20</option>
            <option value="50">Show 50</option>
          </select>
        </div>

        <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 w-full">
              <tr className="text-left">
                <th className="p-3">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  className="border-t"
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{order.user?.name || order.customerName || "Unknown"}</td>
                  <td className="p-3">{order.user?.email || ""}</td>
                  <td className="p-3">${order.orderItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2)}</td>
                  <td className="p-3">
                    <select
                      className={`px-2 py-1 text-sm font-semibold rounded-full ${statusColors[order.status]}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(e.target.value, order.id)}
                      disabled={statusLoadingId === order.id}
                    >
                      {statusList.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                    {statusLoadingId === order.id && <Spinner size={18} className="inline ml-2 align-middle" />}
                  </td>
                  <td className="p-3">{new Date(order.orderDate).toLocaleDateString("en-GB")}</td>
                  <td className="p-3 text-center">
                    <button
                      className="p-2 rounded-full hover:bg-gray-200 relative z-10"
                      onClick={() =>
                        setDropdownOpen(dropdownOpen === order.id ? null : order.id)
                      }
                    >
                      <FaEllipsisV />
                    </button>
                    {dropdownOpen === order.id && (
                      <div className="absolute right-5 bg-white border border-gray-200 shadow-md rounded-lg w-32 z-20">
                        <button onClick={() => openDetailModal(order)} className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left">
                          <FaEdit className="mr-2 text-blue-500" /> Detail
                        </button>
                        <button className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600">
                          <FaTrash className="mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-3/4 max-w-4xl">
            <h2 className="text-2xl font-semibold mb-4 text-center">Order Details</h2>
            <h3 className="text-xl mb-4">Products</h3>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="px-4 py-2">Image</th>
                  <th className="px-4 py-2">Product Name</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.orderItems.map((item, index) => {
                  const product = item.sizeStock?.product || {};
                  const image = Array.isArray(product.image) ? product.image[0] : product.image;
                  return (
                    <tr key={index} className="border-t text-center">
                      <td className="py-2 flex justify-center">
                        <img src={image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                      </td>
                      <td className="py-2">{product.name}</td>
                      <td className="py-2">{item.sizeStock?.size}</td>
                      <td className="py-2">${product.price?.toFixed(2) ?? '0.00'}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">${(product.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
