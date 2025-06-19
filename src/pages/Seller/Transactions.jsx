import { useState, useEffect } from "react";
import AdminLayout from "../Admin/components/AdminLayout";
import Spinner from "../../components/Spinner";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";

export default function SellerTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    axiosInstance.get(`/transactions/seller/${user.id}`)
      .then(res => setTransactions(res.data.data || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredTransactions = transactions.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

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