import { useState } from "react";
import { FaEllipsisH } from "react-icons/fa";
import AdminLayout from "./components/AdminLayout";

const orders = [
  { id: "0901", name: "Marvin McKinney", email: "marvin@example.com", total: 9.00, status: "Pending", date: "03.12.2022" },
  { id: "2323", name: "Leslie Alexander", email: "leslie@example.com", total: 46.61, status: "Pending", date: "21.02.2022" },
  { id: "1233", name: "Esther Howard", email: "esther@example.com", total: 12.00, status: "Canceled", date: "03.07.2022" },
  { id: "1233", name: "Esther Howard", email: "esther@example.com", total: 12.00, status: "Canceled", date: "03.07.2022" },
  { id: "1102", name: "Jonny Wilson", email: "jonny@example.com", total: 588.99, status: "Done", date: "22.05.2022" },
];

const statusColors = {
  "Pending": "bg-orange-100 text-orange-700",
  "Canceled": "bg-red-100 text-red-700",
  "Done": "bg-green-100 text-green-700",
};

export default function OrderList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCount, setShowCount] = useState(20);

  // Lọc đơn hàng theo tìm kiếm và trạng thái
  const filteredOrders = orders.filter(order =>
    (order.name.toLowerCase().includes(search.toLowerCase()) ||
     order.id.includes(search)) &&
    (statusFilter === "" || order.status === statusFilter)
  );

  return (
    <AdminLayout>
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <h1 className="text-3xl font-semibold">Order List</h1>
            <p className="text-gray-500">Lorem ipsum dolor sit amet.</p>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mt-4 flex gap-4 flex-wrap">
                <input
                type="text"
                placeholder="Search..."
                className="w-full sm:w-1/3 p-2 border rounded-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />

                <select
                className="p-2 border rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                >
                <option value="">Status</option>
                <option value="Pending">Pending</option>
                <option value="Canceled">Canceled</option>
                <option value="Done">Done</option>
                </select>

                <select
                className="p-2 border rounded-md"
                value={showCount}
                onChange={(e) => setShowCount(Number(e.target.value))}
                >
                <option value="10">Show 10</option>
                <option value="20">Show 20</option>
                <option value="50">Show 50</option>
                </select>
            </div>

            {/* Order Table */}
            <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                    <tr className="text-left">
                    <th className="p-3">#ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.slice(0, showCount).map((order, index) => (
                    <tr key={index} className="border-t">
                        <td className="p-3">{order.id}</td>
                        <td className="p-3">{order.name}</td>
                        <td className="p-3">{order.email}</td>
                        <td className="p-3">${order.total.toFixed(2)}</td>
                        <td className="p-3">
                        <span className={`px-2 py-1 text-sm font-semibold rounded-full ${statusColors[order.status]}`}>
                            {order.status}
                        </span>
                        </td>
                        <td className="p-3">{order.date}</td>
                        <td className="p-3 flex gap-2">
                        <button className="bg-green-600 text-white px-3 py-1 rounded-md">Detail</button>
                        <button className="text-gray-500">
                            <FaEllipsisH />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
    </AdminLayout>
  );
}
