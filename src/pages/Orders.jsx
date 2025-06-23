import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { OrderService } from '../services/order';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import WebOrderItem from '../components/WebOrderItem';

// No pagination needed as orders are now grouped by status

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const navigate = useNavigate();
  const fetchOrders = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    try {
      const response = await OrderService.getUserOrders(user.id);
      if (response.success) {
        setOrders(response.data || []);
      } else {
        setOrders([]);
        toast.error(response.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("An error occurred while loading your orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);
  
  // Handle refresh after order cancellation
  const handleOrderUpdated = () => {
    fetchOrders();
  };
  // Group orders by status
  const groupOrdersByStatus = (orders) => {
    const grouped = {
      PENDING: [],
      PROCESSING: [],
      SHIPPED: [],
      DELIVERED: [],
      CANCELLED: []
    };

    // Sort by date - newest first
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt)
    );

    // Group orders by status
    sortedOrders.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      } else {
        // Default to PENDING if status not recognized
        grouped.PENDING.push(order);
      }
    });

    return grouped;
  };

  const groupedOrders = groupOrdersByStatus(orders);
  // Status labels and their styles
  const statusGroups = [
    { key: 'ALL', label: 'All Orders', bgColor: 'bg-gray-100', textColor: 'text-gray-800', count: orders.length },
    { key: 'PENDING', label: 'Pending', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800'},
    { key: 'SHIPPED', label: 'Shipped', bgColor: 'bg-purple-100', textColor: 'text-purple-800'},
    { key: 'DELIVERED', label: 'Delivered', bgColor: 'bg-green-100', textColor: 'text-green-800'},
    { key: 'CANCELLED', label: 'Cancelled', bgColor: 'bg-red-100', textColor: 'text-red-800'}
  ];
  
  // Update counts for each status
  statusGroups.forEach(group => {
    if (group.key !== 'ALL') {
      group.count = (groupedOrders[group.key] || []).length;
    }
  });
    // We're not using the separated getPaymentStatusBadge function anymore as it's integrated into the UI  // Handle filter change
  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey);
    // Scroll to the top of the page when changing filters
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get filtered orders based on active filter
  const getFilteredOrders = () => {
    if (activeFilter === 'ALL') {
      return orders;
    }
    return groupedOrders[activeFilter] || [];
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex items-center mb-6">
        <h2 className="text-lg border-b pb-2 text-[#171717]"><span className="text-[#707070]">MY</span> ORDERS</h2>
        <div className="h-[2px] w-[25px] bg-black mb-2 ml-4"></div>
      </div>
      
      {/* Filter Bar */}
      {orders.length > 0 && !loading && (
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {statusGroups.map(group => (
              <button
                key={group.key}
                onClick={() => handleFilterChange(group.key)}
                className={`flex items-center px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors 
                  ${activeFilter === group.key 
                    ? `${group.bgColor} ${group.textColor} border-2 border-gray-300` 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="mr-2">{group.icon}</span>
                <span>{group.label}</span>
                <span className="ml-1 bg-white px-1.5 py-0.5 rounded-full text-xs">
                  {group.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-medium mb-2">No orders found</h3>
          <p>You haven't placed any orders yet.</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Start Shopping
          </button>
        </div>
      ) : filteredOrders.length === 0 && activeFilter !== 'ALL' ? (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No {activeFilter.toLowerCase()} orders found</h3>
          <button 
            onClick={() => setActiveFilter('ALL')}
            className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            View All Orders
          </button>
        </div>
      ) : (<div>
          {activeFilter === 'ALL' ? (
            // Display grouped by status when showing all orders
            <div className="space-y-10">
              {statusGroups.filter(group => group.key !== 'ALL' && group.count > 0).map(group => {
                const ordersInGroup = groupedOrders[group.key] || [];
                
                return (
                  <div key={group.key} className="border-b pb-8 last:border-0">
                    <div className={`flex items-center mb-4 ${group.bgColor} ${group.textColor} px-4 py-2 rounded-md`}>
                      <h3 className="font-medium">{group.label} Orders ({ordersInGroup.length})</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {ordersInGroup.map(order => (
                        <div key={order.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              Order Date: {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                            </div>
                            {order.paymentMethod === "VNPAY" && order.paymentStatus === "PENDING" && (
                              <div className="flex items-center">
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2">
                                  Payment required
                                </span>
                                <button 
                                  onClick={() => navigate(`/orders/${order.id}`)}
                                  className="text-pink-600 text-xs underline"
                                >
                                  Complete payment
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <WebOrderItem 
                            order={order}
                            onPress={() => navigate(`/orders/${order.id}`)}
                            onCancelSuccess={handleOrderUpdated}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Display flat list when filtering by specific status
            <div>
              {filteredOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No {activeFilter.toLowerCase()} orders found</h3>
                  <button 
                    onClick={() => setActiveFilter('ALL')}
                    className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
                  >
                    View All Orders
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Order Date: {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                        </div>
                        {order.status === "PENDING" && order.paymentMethod === "VNPAY" && order.paymentStatus === "PENDING" && (
                          <div className="flex items-center">
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2">
                              Payment required
                            </span>
                            <button 
                              onClick={() => navigate(`/orders/${order.id}`)}
                              className="text-pink-600 text-xs underline"
                            >
                              Complete payment
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <WebOrderItem 
                        order={order}
                        onPress={() => navigate(`/orders/${order.id}`)}
                        onCancelSuccess={handleOrderUpdated}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>      )}
    </div>
  );
};

export default Orders;
