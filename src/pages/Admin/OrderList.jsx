import { useState, useEffect, useCallback } from "react";
import { FaEdit, FaEllipsisV, FaTrash } from "react-icons/fa";
import AdminLayout from "./components/AdminLayout";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";
import { motion } from "framer-motion";
import useSeller from '../../hooks/useSeller';
import Spinner from '../../components/Spinner';

const statusColors = {
  "PENDING": "bg-orange-100 text-orange-700",
  "CANCELED": "bg-red-100 text-red-700",
  "COMPLETED": "bg-green-100 text-green-700",
};

const statusList = ["PENDING", "CANCELED", "COMPLETED"];

export default function OrderList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCount, setShowCount] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const user = useAuth();
  const [orders, setOrders] = useState([]);
  const { seller, loading: sellerLoading } = useSeller();
  const [loading, setLoading] = useState(true);

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
      if (!seller?.id) return;
      const response = await axiosInstance.get(`/orders/seller/${seller.id}`);
      const ordersData = response.data.data;
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [seller?.id]);

  useEffect(() => {
    if (seller?.id) {
      getList();
    }
  }, [seller?.id, getList]);

  // Filter and search logic
  const filteredOrders = orders
    .filter(order =>
      (!statusFilter || order.status === statusFilter.toUpperCase()) &&
      (!search || (order.user?.name?.toLowerCase().includes(search.toLowerCase()) || order.user?.email?.toLowerCase().includes(search.toLowerCase())))
    )
    .slice(0, showCount);

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
      await axiosInstance.patch(`/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <AdminLayout>
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
            <option value="PENDING">Pending</option>
            <option value="CANCELED">Canceled</option>
            <option value="COMPLETED">Done</option>
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
        {loading ? (
          <div className="flex justify-center items-center py-10"><Spinner /></div>
        ) : (
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
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  className="border-t"
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{order.user?.name || 'N/A'}</td>
                  <td className="p-3">{order.user?.email || 'N/A'}</td>
                  <td className="p-3">${order.totalPrice?.toFixed(2) ?? 'N/A'}</td>
                  <td className="p-3">
                    <select
                      className={`px-2 py-1 text-sm font-semibold rounded-full ${statusColors[order.status]}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(e.target.value, order.id)}
                    >
                      {statusList.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-center">
                    <button
                      className="p-2 rounded-full hover:bg-gray-200 relative z-10"
                      onClick={() => setDropdownOpen(dropdownOpen === order.id ? null : order.id)}
                    >
                      <FaEllipsisV />
                    </button>
                    {dropdownOpen === order.id && (
                      <div className="absolute right-5 bg-white border border-gray-200 shadow-md rounded-lg w-32 z-20">
                        <button onClick={() => openDetailModal(order)} className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left">
                          <FaEdit className="mr-2 text-pink-500" /> Detail
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
        )}
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
                {selectedOrder.orderItems && selectedOrder.orderItems.map((item, index) => (
                  <tr key={index} className="border-t text-center">
                    <td className="py-2 flex justify-center">
                      <img src={item.sizeStock.product.image[0]} alt={item.sizeStock.product.name} className="w-12 h-12 object-cover rounded-md" />
                    </td>
                    <td className="py-2">{item.sizeStock.product.name}</td>
                    <td className="py-2">{item.sizeStock.size}</td>
                    <td className="py-2">${item.sizeStock.product.price.toFixed(2)}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">${item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
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
