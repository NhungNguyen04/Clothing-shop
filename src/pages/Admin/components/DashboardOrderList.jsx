import { useEffect, useState } from "react";
import SellerReportService from '../../../services/seller/report';

const statusColors = {
  Paid: "bg-green-100 text-green-700",
  Chargeback: "bg-red-100 text-red-700",
  Refund: "bg-yellow-100 text-yellow-700"
};

export default function OrdersList({ sellerId, limit = 5 }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!sellerId) return;
    setLoading(true);
    SellerReportService.getOrdersReport(sellerId, undefined, 1, 100)
      .then(data => {
        setOrders(data.orders || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [sellerId]);

  const recentOrders = orders.slice(0, limit);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading) return <div className="p-6 text-center">Loading orders...</div>;
  if (!orders.length) return <div className="p-6 text-center text-gray-500">No orders found.</div>;

  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Order ID</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Date</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3">View Details</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="p-3 text-blue-500">{order.id}</td>
              <td className="p-3">{order.customerName || order.user?.name || order.user?.email || 'N/A'}</td>
              <td className="p-3">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
              <td className="p-3">{typeof order.totalPrice === 'number' ? `$${order.totalPrice.toFixed(2)}` : 'N/A'}</td>
              <td className="p-3">
                <span className={`px-2 py-1 text-sm rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status}
                </span>
              </td>
              <td className="p-3">
                <button className="bg-teal-700 text-white px-3 py-1 rounded" onClick={() => handleViewDetails(order)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">{typeof item.totalPrice === 'number' ? `$${item.totalPrice.toFixed(2)}` : 'N/A'}</td>
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
    </>
  );
}
