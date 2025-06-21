import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import { OrderService } from '../services/order';
import { toast } from 'react-toastify';

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Timeline steps
  const TIMELINE_STEPS = [
    { key: 'CREATED', label: 'Order placed' },
    { key: 'CONFIRMED', label: 'Order confirmed' },
    { key: 'SHIPPED', label: 'Order shipped' },
    { key: 'DELIVERED', label: 'Order delivered' },
    { key: 'CANCELLED', label: 'Order cancelled' }
  ];

  // Fake timeline data
  const fakeTimeline = [
    {
      date: 'OCTOBER 20',
      events: [
        {
          time: '10:42 PM',
          text: 'This order was completed',
          image: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
        },
        {
          time: '10:42 PM',
          text: 'Shipping confirmation email was sent to Michel Jony (michel.joni@gmail.com).',
          image: 'https://cdn-icons-png.flaticon.com/512/561/561127.png',
          button: 'Resend email',
        },
      ],
    },
    {
      date: 'OCTOBER 18',
      events: [
        {
          time: '09:22 PM',
          text: 'Order confirmation email was sent to Michel Jony (michel.joni@gmail.com).',
          image: 'https://cdn-icons-png.flaticon.com/512/561/561127.png',
          button: 'Resend email',
        },
        {
          time: '09:22 PM',
          text: 'A $136 USD payment was processed on paypal Express Checkout...',
          image: 'https://cdn-icons-png.flaticon.com/512/633/633611.png',
        },
        {
          time: '09:22 PM',
          text: 'Michel Jony place this order on Online store (checkout SPRITE-100063)',
          image: 'https://cdn-icons-png.flaticon.com/512/190/190406.png',
        },
      ],
    },
  ];
  const fetchOrder = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const response = await OrderService.getOrderById(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setOrder(null);
        toast.error(response.message || "Failed to load order details");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("An error occurred while loading the order details");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);
  // Determine current step index
  const statusIndex = TIMELINE_STEPS.findIndex(s => s.key === order?.status);
  
  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      setLoading(true);
      try {
        const response = await OrderService.cancelOrder(orderId);
        if (response.success) {
          toast.success("Order cancelled successfully");
          // Refresh order data
          fetchOrder();
        } else {
          toast.error(response.message || "Failed to cancel order");
        }
      } catch (error) {
        console.error("Cancel order error:", error);
        toast.error("An error occurred while cancelling the order");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <Spinner />;
  if (!order) return <div className="text-center py-10">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">      <div className="flex justify-between items-center mb-6">
        <div>
        <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">&larr; Back</button>
          <div className="text-xl font-bold">Order #{order.id}</div>
          <div className="text-gray-500">{new Date(order.orderDate || order.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex flex-col items-end">
          <span className="px-3 py-1 rounded bg-green-100 text-green-700 font-semibold mb-2">{order.status}</span>
          {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
            <button 
              onClick={handleCancelOrder} 
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
      <div className="mb-6">
        <div className="font-semibold mb-2">Order Details</div>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Product name</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>            {order.orderItems.map(item => (
              <tr key={item.id}>
                <td className="p-2 border">
                  <div className="flex items-center">
                    {item.sizeStock?.product?.image && item.sizeStock.product.image.length > 0 ? (
                      <img 
                        src={item.sizeStock.product.image[0]} 
                        alt={item.sizeStock?.product?.name || 'Product'} 
                        className="w-12 h-12 object-cover rounded mr-2"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <span>{item.sizeStock?.product?.name || 'Unknown Product'}</span>
                  </div>
                </td>
                <td className="p-2 border">x{item.quantity}</td>
                <td className="p-2 border">${Number(item.sizeStock?.product?.price).toFixed(2)}</td>
                <td className="p-2 border">${Number(item.totalPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <div className="font-semibold mb-2">Paid by Customer</div>
        <div>Subtotal: ${order.orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0).toFixed(2)}</div>
        <div>Shipping: $10.00</div>
        <div className="font-bold">Total paid by customer: ${(order.orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0) + 10).toFixed(2)}</div>
      </div>      <div className="mb-6">
        <div className="font-semibold mb-2">Customer Information</div>
        <div>Name: {order.customerName || order.user?.firstName + ' ' + order.user?.lastName || 'N/A'}</div>
        <div>Phone: {order.phoneNumber}</div>
        <div>Address: {order.address}</div>
        <div>Payment: {order.paymentMethod}</div>
      </div>
      
      {order.shipment && (
        <div className="mb-6">
          <div className="font-semibold mb-2">Shipment Information</div>
          <div className="flex gap-2">
            <span 
              className={`px-3 py-1 rounded text-white text-sm ${
                order.shipment.status === 'DELIVERED' ? 'bg-green-500' : 
                order.shipment.status === 'SHIPPED' ? 'bg-purple-500' : 'bg-yellow-500'
              }`}
            >
              {order.shipment.status}
            </span>
          </div>
          {order.shipment.deliveryDate && (
            <div>Delivery Date: {new Date(order.shipment.deliveryDate).toLocaleDateString()}</div>
          )}
        </div>
      )}
      
      <div className="text-sm text-gray-500">Current status: {order.status}</div>
    </div>
  );
};

export default TrackOrder;