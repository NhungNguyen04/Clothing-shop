import { useEffect, useState } from 'react';
import AdminLayout from "./components/AdminLayout";
import OrdersList from "./components/DashboardOrderList";
import ReportService from '../../services/admin/report';
import Spinner from '../../components/Spinner';
import { assets } from '../../assets/assets';
import { FaUser, FaStore, FaBox, FaShoppingCart, FaDollarSign, FaUserClock } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [orderReport, setOrderReport] = useState(null);
  const [userReport, setUserReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [overviewData, sales, orders, users, inventory] = await Promise.all([
          ReportService.getAdminSystemOverview(),
          ReportService.getAdminSalesReport({}),
          ReportService.getAdminOrderReport({}),
          ReportService.getAdminUserReport(),
          ReportService.getAdminInventoryReport({}),
        ]);
        setOverview(overviewData);
        setSalesReport(sales);
        setOrderReport(orders);
        setUserReport(users);
        setInventoryReport(inventory);
      } catch (e) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  if (error) return <div className="text-center text-red-500 p-6">{error}</div>;
  if (!overview) return null;

  // Chart data transform
  const salesLineData = salesReport ? Object.entries(salesReport.salesByDate).map(([month, value]) => ({ month, revenue: value })) : [];
  const userPieData = userReport ? [
    { name: 'Admin', value: userReport.usersByRole.ADMIN },
    { name: 'Seller', value: userReport.usersByRole.SELLER },
    { name: 'Customer', value: userReport.usersByRole.CUSTOMER },
  ] : [];
  const orderBarData = orderReport ? Object.entries(orderReport.ordersByStatus).map(([status, value]) => ({ status, count: value })) : [];
  const inventoryPieData = inventoryReport ? [
    { name: 'In Stock', value: inventoryReport.totalProducts - inventoryReport.outOfStockCount },
    { name: 'Out of Stock', value: inventoryReport.outOfStockCount },
  ] : [];
  const COLORS = ['#22c55e', '#f43f5e', '#3b82f6', '#f59e42'];

  return (
    <AdminLayout>
      <div className="space-y-8 p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
          <MetricCard title="Users" value={overview.userCount} color="text-blue-600" icon={<FaUser className="text-blue-600" />} />
          <MetricCard title="Sellers" value={overview.sellerCount} color="text-purple-600" icon={<FaStore className="text-purple-600" />} />
          <MetricCard title="Products" value={overview.productCount} color="text-green-600" icon={<FaBox className="text-green-600" />} />
          <MetricCard title="Orders" value={overview.orderCount} color="text-yellow-600" icon={<FaShoppingCart className="text-yellow-600" />} />
          <MetricCard title="Revenue" value={`$${overview.totalRevenue?.toLocaleString()}`} color="text-amber-600" icon={<FaDollarSign className="text-amber-600" />} />
          <MetricCard title={<span>Pending<br/>Sellers</span>} value={overview.pendingSellerCount} color="text-red-600" icon={<FaUserClock className="text-red-600" />} />
        </div>
        {/* Chart Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sales Line Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Revenue by Month</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesLineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* User Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">User Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={userPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {userPieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Order Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={orderBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Inventory Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Inventory Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={inventoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {inventoryPieData.map((entry, idx) => <Cell key={`cell-inv-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {overview.recentOrders?.map(order => (
                <tr key={order.id} className="border-b">
                  <td className="p-3 text-blue-500">{order.id}</td>
                  <td className="p-3">{order.user?.name || 'N/A'}</td>
                  <td className="p-3">{order.seller?.user?.name || 'N/A'}</td>
                  <td className="p-3">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="p-3">${order.totalPrice?.toFixed(2) ?? 'N/A'}</td>
                  <td className="p-3">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
function MetricCard({ title, value, color, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
      <div className="mb-2 text-3xl">{icon}</div>
      <div className={`text-lg font-semibold mb-1 ${color} text-center`}>{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

