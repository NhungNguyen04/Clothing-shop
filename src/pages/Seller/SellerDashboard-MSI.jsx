import AdminLayout from "../Admin/components/AdminLayout";
import OrdersList from "../Admin/components/DashboardOrderList";
import { FaBox, FaMoneyBillWave, FaShoppingCart, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';
import InventoryReport from './components/InventoryReport';
import RevenueReport from './components/RevenueReport';
import TopProductsReport from './components/TopProductsReport';
import useAuth from "../../hooks/useAuth";

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
  const dashboardData = {
    totalProducts: 1,
    totalRevenue: 1100,
    pendingOrders: 3,
    lowStockProducts: 1,
    totalOrders: 5,
    averageRating: 3.67,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Total Products"
            value={dashboardData.totalProducts}
            icon={FaBox}
            color="text-blue-600"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${dashboardData.totalRevenue.toLocaleString()}`}
            icon={FaMoneyBillWave}
            color="text-green-600"
          />
          <MetricCard
            title="Total Orders"
            value={dashboardData.totalOrders}
            icon={FaShoppingCart}
            color="text-purple-600"
          />
          <MetricCard
            title="Pending Orders"
            value={dashboardData.pendingOrders}
            icon={MdPendingActions}
            color="text-yellow-600"
          />
          <MetricCard
            title="Low Stock Products"
            value={dashboardData.lowStockProducts}
            icon={FaExclamationTriangle}
            color="text-red-600"
          />
          <MetricCard
            title="Average Rating"
            value={dashboardData.averageRating.toFixed(2)}
            icon={FaStar}
            color="text-amber-600"
          />
        </div>

        {/* Inventory Report */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Inventory Report</h2>
          <InventoryReport sellerId={user?.idSeller} />
        </div>

        {/* Revenue Report */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Revenue Report</h2>
          <RevenueReport sellerId={user?.idSeller} />
        </div>

        {/* Top Products Report */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Top Products Report</h2>
          <TopProductsReport sellerId={user?.idSeller} />
        </div>

        {/* Orders List */}
        <OrdersList />
      </div>
    </AdminLayout>
  );
}