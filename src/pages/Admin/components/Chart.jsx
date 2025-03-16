import { FaDollarSign, FaTruck, FaBox, FaWallet, FaPlus } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";

const stats = [
  { title: "Revenue", value: "$13,456.5", desc: "Shipping fees are not included", icon: <FaDollarSign />, color: "bg-green-100 text-green-600" },
  { title: "Orders", value: "53.668", desc: "Excluding orders in transit", icon: <FaTruck />, color: "bg-blue-100 text-blue-600" },
  { title: "Products", value: "9.856", desc: "In 19 Categories", icon: <FaBox />, color: "bg-orange-100 text-orange-600" },
  { title: "Monthly Earning", value: "$6,982", desc: "Based in your local time", icon: <FaWallet />, color: "bg-cyan-100 text-cyan-600" },
];

const lineData = [
  { name: "Jan", sales: 20, visitors: 40, products: 30 },
  { name: "Feb", sales: 15, visitors: 30, products: 20 },
  { name: "Mar", sales: 10, visitors: 25, products: 15 },
  { name: "Apr", sales: 5, visitors: 20, products: 10 },
  { name: "May", sales: 25, visitors: 35, products: 25 },
  { name: "Jun", sales: 30, visitors: 40, products: 20 },
  { name: "Jul", sales: 35, visitors: 30, products: 15 },
  { name: "Aug", sales: 40, visitors: 25, products: 10 },
  { name: "Sep", sales: 30, visitors: 35, products: 20 },
  { name: "Oct", sales: 25, visitors: 30, products: 25 },
  { name: "Nov", sales: 20, visitors: 25, products: 30 },
  { name: "Dec", sales: 10, visitors: 20, products: 35 },
];

const barData = [
  { area: "900", US: 200, Europe: 100, Asia: 150, Africa: 50 },
  { area: "1200", US: 300, Europe: 200, Asia: 250, Africa: 150 },
  { area: "1400", US: 500, Europe: 400, Asia: 350, Africa: 200 },
  { area: "1600", US: 800, Europe: 500, Asia: 450, Africa: 300 },
];

export default function Chart() {
  return (
    <div className="p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Whole data about your business here</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FaPlus /> Create report
        </button>
      </div>
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
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sale statistics</h2>
          <LineChart width={500} height={300} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#4285F4" fill="#4285F4" />
            <Line type="monotone" dataKey="visitors" stroke="#34A853" fill="#34A853" />
            <Line type="monotone" dataKey="products" stroke="#EA4335" fill="#EA4335" />
          </LineChart>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Revenue Base on Area</h2>
          <BarChart width={500} height={300} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="area" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="US" fill="#4285F4" />
            <Bar dataKey="Europe" fill="#FBBC05" />
            <Bar dataKey="Asia" fill="#EA4335" />
            <Bar dataKey="Africa" fill="#A142F4" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
