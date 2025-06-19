import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ORDERS_PER_PAGE = 3;

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.id) return;
    setLoading(true);
    axiosInstance.get(`/orders/user/${user.id}`)
      .then(res => {
        setOrders(res.data.data || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);

  const getStatusButton = (status) => {
    if (status === "PENDING") {
      return  ( <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="text-gray-800 font-medium">Pending</span>
                </div>
              )
    }
    if (status === "SHIPPED") {
      return  ( <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-gray-800 font-medium">Shipped</span>
                </div>
              )
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
          <div className="flex items-center">
            <h2 className="text-lg border-b pb-2 text-[#171717]"><span className="text-[#707070]">MY</span> ORDERS</h2>
            <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
          </div>
      {loading && <Spinner />}
          <div className="mt-4">
        {paginatedOrders.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">No orders found.</div>
        )}
        {paginatedOrders.map(order => (
          <div key={order.id} className="flex items-center justify-between border-b py-4">
            <div>
              <div className="font-semibold">Order #{order.id}</div>
              <div className="text-sm text-gray-500">Date: {new Date(order.orderDate || order.createdAt).toLocaleDateString()}</div>
              <div className="text-sm text-gray-500">Total: ${Number(order.totalPrice || order.totalCartValue).toFixed(2)}</div>
              <div className="text-sm text-gray-500">Status: {getStatusButton(order.status)}</div>
                      </div>
            <button
              className="ml-4 cursor-pointer border border-[#BABABA] rounded-md py-2 px-4"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
                  Track Order
            </button>
              </div>
            ))}
          </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`px-3 py-1 border ${page === idx + 1 ? 'bg-gray-200' : ''}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
        </div>
  )
}

export default Orders
