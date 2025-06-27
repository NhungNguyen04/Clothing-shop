import { useEffect, useState } from 'react';
import AdminLayout from "../Admin/components/AdminLayout";
import Chart from "../Admin/components/Chart";
import OrdersList from "../Admin/components/DashboardOrderList";
import { FaComment, FaBox, FaShoppingCart, FaDollarSign, FaMoneyBillWave, FaExclamationTriangle, FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import SellerReportService from '../../services/seller/report';
import useAuth from "../../hooks/useAuth";
import { MdPendingActions } from 'react-icons/md';
import InventoryReport from './components/InventoryReport';
import RevenueReport from './components/RevenueReport';
import TopProductsReport from './components/TopProductsReport';

const MetricCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`${color} opacity-80`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInventory, setShowInventory] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);
  const [showTopProducts, setShowTopProducts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.idSeller) return;
      setLoading(true);
      try {
        const data = await SellerReportService.getDashboardSummary(user.idSeller);
        setDashboardData(data);
      } catch (e) {
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user?.idSeller]);

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <MetricCard
            title="Total Products"
            value={loading ? '...' : dashboardData?.totalProducts ?? 0}
            icon={FaBox}
            color="text-blue-600"
          />
          <MetricCard
            title="Total Revenue"
            value={loading ? '...' : `$${dashboardData?.totalRevenue?.toLocaleString() ?? 0}`}
            icon={FaMoneyBillWave}
            color="text-green-600"
          />
          <MetricCard
            title="Total Orders"
            value={loading ? '...' : dashboardData?.totalOrders ?? 0}
            icon={FaShoppingCart}
            color="text-purple-600"
          />
          <MetricCard
            title="Pending Orders"
            value={loading ? '...' : dashboardData?.pendingOrders ?? 0}
            icon={MdPendingActions}
            color="text-yellow-600"
          />
          <MetricCard
            title="Low Stock Products"
            value={loading ? '...' : dashboardData?.lowStockProducts ?? 0}
            icon={FaExclamationTriangle}
            color="text-red-600"
          />
          <MetricCard
            title="Average Rating"
            value={loading ? '...' : (dashboardData?.averageRating?.toFixed(2) ?? '0.00')}
            icon={FaStar}
            color="text-amber-600"
          />
        </div>
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowInventory((v) => !v)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showInventory ? 'Close Inventory Report' : 'Open Inventory Report'}
          </button>
          <button
            onClick={() => setShowRevenue((v) => !v)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showRevenue ? 'Close Revenue Report' : 'Open Revenue Report'}
          </button>
          <button
            onClick={() => setShowTopProducts((v) => !v)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {showTopProducts ? 'Close Top Products Report' : 'Open Top Products Report'}
          </button>
        </div>
        {showInventory && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Inventory Report</h2>
            <InventoryReport sellerId={user?.idSeller} />
          </div>
        )}
        {showRevenue && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Revenue Report</h2>
            <RevenueReport sellerId={user?.idSeller} />
          </div>
        )}
        {showTopProducts && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Top Products Report</h2>
            <TopProductsReport sellerId={user?.idSeller} />
          </div>
        )}
        {/* Recent Orders Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <OrdersList sellerId={user?.idSeller} limit={5} />
        </div>
      </div>
    </AdminLayout>
  );
}