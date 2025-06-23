import AdminLayout from "../Admin/components/AdminLayout";
import Chart from "../Admin/components/Chart";
import OrdersList from "../Admin/components/DashboardOrderList";
import { FaComment, FaBox, FaShoppingCart, FaDollarSign } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Dashboard() {
    return (
      <AdminLayout>
          <div className="p-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Link to="/seller/chats" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <FaComment className="text-2xl text-pink-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Customer Chats</h3>
                      <p className="text-sm text-gray-600">View conversations</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/seller/products" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <FaBox className="text-2xl text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Products</h3>
                      <p className="text-sm text-gray-600">Manage inventory</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/seller/orders" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <FaShoppingCart className="text-2xl text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Orders</h3>
                      <p className="text-sm text-gray-600">View orders</p>
                    </div>
                  </div>
                </Link>
                
                <Link to="/seller/transactions" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <FaDollarSign className="text-2xl text-yellow-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Transactions</h3>
                      <p className="text-sm text-gray-600">View earnings</p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <Chart/>
              <OrdersList/>
          </div>
      </AdminLayout>
    );
  }