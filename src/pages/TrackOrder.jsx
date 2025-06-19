import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import axiosInstance from '../api/axiosInstance';

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

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    axiosInstance.get(`/orders/${orderId}`)
      .then(res => setOrder(res.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  // Determine current step index
  const statusIndex = TIMELINE_STEPS.findIndex(s => s.key === order?.status);

  if (loading) return <Spinner />;
  if (!order) return <div className="text-center py-10">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
        <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">&larr; Back</button>
          <div className="text-xl font-bold">Order #{order.id}</div>
          <div className="text-gray-500">{new Date(order.orderDate || order.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <span className="px-3 py-1 rounded bg-green-100 text-green-700 font-semibold">{order.status}</span>
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
          <tbody>
            {order.orderItems.map(item => (
              <tr key={item.id}>
                <td className="p-2 border">{item.sizeStock?.product?.name}</td>
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
      </div>
      <div className="mb-6">
        <div className="font-semibold mb-2">Customer Information</div>
        <div>Name: {order.customerName || 'N/A'}</div>
        <div>Phone: {order.phoneNumber}</div>
        <div>Address: {order.address}</div>
        <div>Payment: {order.paymentMethod}</div>
      </div>
      <div>
        <div className="font-semibold mb-2">Timeline</div>
        <div className="border-l-2 border-gray-200 pl-4">
          {fakeTimeline.map((section, sectionIdx) => (
            <div key={section.date} className="mb-6">
              <div className="text-xs text-gray-400 mb-2">{section.date}</div>
              {section.events.map((event, idx) => (
                <div key={idx} className="flex items-center mb-4">
                  {/* Index column */}
                  <div className="w-6 flex-shrink-0 flex flex-col items-center">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">{idx + 1}</div>
                  </div>
                  {/* Image column */}
                  <div className="w-10 flex-shrink-0 flex items-center justify-center ml-2">
                    <img src={event.image} alt="event" className="w-8 h-8 object-cover rounded-full" />
                  </div>
                  {/* Event details */}
                  <div className="ml-4 flex-1">
                    <div className="text-sm font-medium">{event.text}</div>
                    {event.button && (
                      <button className="mt-1 px-2 py-1 border rounded text-xs hover:bg-gray-100">{event.button}</button>
                    )}
                  </div>
                  <div className="ml-4 text-xs text-gray-400 w-16 text-right">{event.time}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500">Current status: {order.status}</div>
      </div>
    </div>
  );
};

export default TrackOrder;