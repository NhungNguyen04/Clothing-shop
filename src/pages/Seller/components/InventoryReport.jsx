import { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

// Helper function to format date to 'yyyy-MM-dd'
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const InventoryReport = ({ sellerId }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    lowStock: true,
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    limit: 10,
    page: 1
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const params = {
        lowStock: filters.lowStock,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit,
        page: filters.page
      };

      const response = await axiosInstance.get(`/seller-report/${sellerId}/inventory`, { params });
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      // Optionally, set an error state to show in the UI
    } finally {
      setLoading(false);
    }
  };

  const ReportMetadata = ({ meta }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-100 p-4 rounded-lg">
      <div className="text-center">
        <p className="text-sm text-gray-600">Total Products</p>
        <p className="text-2xl font-bold">{meta.total}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Low Stock</p>
        <p className="text-2xl font-bold text-yellow-600">{meta.lowStockCount}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Out of Stock</p>
        <p className="text-2xl font-bold text-red-600">{meta.outOfStockCount}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Total Pages</p>
        <p className="text-2xl font-bold">{meta.totalPages}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Inventory Report
      </button>

      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-lg font-semibold mb-4">Report Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter for low stock items
              </label>
              <select
                value={filters.lowStock.toString()}
                onChange={(e) => setFilters({ ...filters, lowStock: e.target.value === 'true' })}
                className="w-full border rounded-md p-2"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full border rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full border rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <input
                type="number"
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                className="w-full border rounded-md p-2"
                min="1"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      )}

      {loading && (
         <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
         </div>
      )}

      {reportData && (
        <div className="mt-6">
          <ReportMetadata meta={reportData.meta} />
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img src={product.image[0]} alt={product.name} className="h-12 w-12 rounded-md object-cover mr-4" />
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category} / {product.subCategory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <span className='font-semibold'>Total: {product.stockQuantity}</span>
                        {product.stockSize.map(size => (
                          <div key={size.id} className='text-xs text-gray-600'>
                            - {size.size}: {size.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.averageRating?.toFixed(2)} ({product.reviews} reviews)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReport; 