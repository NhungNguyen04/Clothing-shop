import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { FaUser, FaUsers, FaUserTie } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";
import Spinner from "../../../components/Spinner";

function extractProvince(address) {
  if (!address) return "Unknown";
  const parts = address.split(",");
  return parts[parts.length - 1].trim();
}

function normalizeProvince(province) {
  return province
    .replace(/^tỉnh\s+/i, "") // bỏ tiền tố 'tỉnh'
    .replace(/[^a-zA-ZÀ-ỹ0-9 ]/g, "") // bỏ ký tự đặc biệt
    .trim()
    .toLowerCase();
}

export default function Chart() {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderAreaData, setOrderAreaData] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get("/report/users")
      .then(res => setUserStats(res.data))
      .catch(() => setError("Failed to load user stats"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setOrderLoading(true);
    axiosInstance.get("/orders/all")
      .then(res => {
        const orders = res.data.data || [];
        const provinceCount = {};
        orders.forEach(order => {
          const provinceRaw = extractProvince(order.address);
          const province = normalizeProvince(provinceRaw);
          provinceCount[province] = (provinceCount[province] || 0) + 1;
        });
        // Convert to array, sort by count desc, and take top 5
        const data = Object.entries(provinceCount)
          .map(([province, count]) => ({ province, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          // Hiển thị tên tỉnh viết hoa chữ cái đầu cho đẹp
          .map(({province, count}) => ({
            province: province.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            count
          }));
        setOrderAreaData(data);
      })
      .catch(() => setOrderError("Failed to load order area data"))
      .finally(() => setOrderLoading(false));
  }, []);

  const stats = userStats ? [
    {
      title: "Total Users",
      value: userStats.totalUsers,
      desc: "All registered users",
      icon: <FaUsers />, color: "bg-pink-100 text-pink-600"
    },
    {
      title: "Total Sellers",
      value: userStats.totalSellers,
      desc: `Approved: ${userStats.sellersByStatus?.APPROVED ?? 0}, Pending: ${userStats.sellersByStatus?.PENDING ?? 0}, Rejected: ${userStats.sellersByStatus?.REJECTED ?? 0}`,
      icon: <FaUserTie />, color: "bg-green-100 text-green-600"
    },
    {
      title: "Admins",
      value: userStats.usersByRole?.ADMIN ?? 0,
      desc: "System administrators",
      icon: <FaUser />, color: "bg-cyan-100 text-cyan-600"
    },
    {
      title: "Customers",
      value: userStats.usersByRole?.CUSTOMER ?? 0,
      desc: "Regular customers",
      icon: <FaUser />, color: "bg-orange-100 text-orange-600"
    },
  ] : [];

  let lineData = [];
  if (userStats?.userTrendsByMonth) {
    lineData = Object.entries(userStats.userTrendsByMonth).map(([month, count]) => ({
      name: month,
      users: count
    }));
  }

  return (
    <div className="p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Whole data about your business here</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                <div className={`p-3 rounded-full ${stat.color} text-2xl`}>{stat.icon}</div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">{stat.title}</h2>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">User Trends by Month</h2>
              <LineChart width={500} height={300} data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#4285F4" fill="#4285F4" />
              </LineChart>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Revenue Base on Area</h2>
              {orderLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : orderError ? (
                <div className="text-center text-red-500 py-8">{orderError}</div>
              ) : (
                <BarChart width={500} height={300} data={orderAreaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="province" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Tỉnh/Thành" fill="#4285F4" />
                </BarChart>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
