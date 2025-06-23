import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import AdminLayout from "./components/AdminLayout";

const transactions = [
  { id: "#456667", paid: "$294.00", method: "Amex", date: "16.12.2022, 14:21" },
  { id: "#134768", paid: "$294.00", method: "Master card", date: "16.12.2022, 14:21" },
  { id: "#134768", paid: "$294.00", method: "Paypal", date: "16.12.2022, 14:21" },
  { id: "#134768", paid: "$294.00", method: "Visa", date: "16.12.2022, 14:21" },
  { id: "#887780", paid: "$294.00", method: "Visa", date: "16.12.2022, 14:21" },
  { id: "#344556", paid: "$294.00", method: "Visa", date: "16.12.2022, 14:21" },
  { id: "#134768", paid: "$294.00", method: "Master card", date: "16.12.2022, 14:21" },
  { id: "#998784", paid: "$294.00", method: "Paypal", date: "16.12.2022, 14:21" },
];

export default function Transactions() {
  const [search, setSearch] = useState("");
  const filteredTransactions = transactions.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="border px-4 py-2 w-64 rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="bg-pink-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <FaSearch /> Search
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Transaction ID</th>
                <th className="p-3 text-left">Paid</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{t.id}</td>
                  <td className="p-3">{t.paid}</td>
                  <td className="p-3">{t.method}</td>
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">
                    <button className="bg-gray-500 text-white px-3 py-1 rounded-md">Details</button>
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
