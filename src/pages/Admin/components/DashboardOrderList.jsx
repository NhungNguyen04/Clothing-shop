import { useState } from "react";

const ordersData = [
  { id: "#SK2540", name: "Neal Matthews", date: "07 Oct, 2022", total: "$400", status: "Paid", method: "Mastercard" },
  { id: "#SK2541", name: "Jamal Burnett", date: "07 Oct, 2022", total: "$380", status: "Chargeback", method: "Visa" },
  { id: "#SK2542", name: "Juan Mitchell", date: "06 Oct, 2022", total: "$384", status: "Paid", method: "Paypal" },
  { id: "#SK2543", name: "Barry Dick", date: "05 Oct, 2022", total: "$412", status: "Paid", method: "Mastercard" },
  { id: "#SK2544", name: "Ronald Taylor", date: "04 Oct, 2022", total: "$404", status: "Refund", method: "Visa" },
  { id: "#SK2545", name: "Jacob Hunter", date: "04 Oct, 2022", total: "$392", status: "Paid", method: "Paypal" }
];

const statusColors = {
  Paid: "bg-green-100 text-green-700",
  Chargeback: "bg-red-100 text-red-700",
  Refund: "bg-yellow-100 text-yellow-700"
};

export default function OrdersList() {
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;
  const totalPages = Math.ceil(ordersData.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const paginatedOrders = ordersData.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  return (
    <div className="p-6 m-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Latest Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Order ID</th>
              <th className="p-3">Billing Name</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment Status</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3">View Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-3 text-blue-500">{order.id}</td>
                <td className="p-3">{order.name}</td>
                <td className="p-3">{order.date}</td>
                <td className="p-3">{order.total}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-sm rounded ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">{order.method}</td>
                <td className="p-3">
                  <button className="bg-teal-700 text-white px-3 py-1 rounded">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        <button onClick={() => handlePageChange(currentPage - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" disabled={currentPage === 1}>
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-teal-700 text-white" : "bg-gray-200"}`}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
