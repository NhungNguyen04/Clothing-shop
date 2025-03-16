import { useState } from "react";
import { FaPlus, FaUser, FaUsers, FaUserShield } from "react-icons/fa";
import AdminLayout from "./components/AdminLayout";

const accountsData = {
  seller: [
    { id: "S001", name: "John Doe", email: "john@seller.com", joined: "2023-01-15" },
    { id: "S002", name: "Jane Smith", email: "jane@seller.com", joined: "2022-11-20" }
  ],
  customer: [
    { id: "C001", name: "Alice Brown", email: "alice@customer.com", joined: "2023-02-10" },
    { id: "C002", name: "Bob White", email: "bob@customer.com", joined: "2022-10-05" }
  ],
  admin: [
    { id: "A001", name: "Super Admin", email: "admin@site.com", joined: "2021-09-30" }
  ]
};

// eslint-disable-next-line react/prop-types
const AccountPage = ({ type }) => {
  const [accounts] = useState(accountsData[type] || []);
  
  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold capitalize">{type} Accounts</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <FaPlus /> Create New
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-t">
                  <td className="p-3">{account.id}</td>
                  <td className="p-3 flex items-center gap-2">
                    {type === "seller" && <FaUser className="text-blue-500" />}
                    {type === "customer" && <FaUsers className="text-green-500" />}
                    {type === "admin" && <FaUserShield className="text-red-500" />}
                    {account.name}
                  </td>
                  <td className="p-3">{account.email}</td>
                  <td className="p-3">{account.joined}</td>
                  <td className="p-3 text-center">
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
};

export default AccountPage;
