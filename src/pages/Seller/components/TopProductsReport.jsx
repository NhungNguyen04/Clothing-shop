import { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const TopProductsReport = ({ sellerId }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    limit: 5
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const params = { ...filters };
      const response = await axiosInstance.get(`/seller-report/${sellerId}/top-products`, { params });
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating top products report:', error);
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product, title, subtitle }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="flex items-start space-x-4">
        <img 
          src={product.image[0]} 
          alt={product.name} 
          className="h-16 w-16 rounded-md object-cover flex-shrink-0" 
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-green-600">${product.price}</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">★ {product.averageRating?.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({product.reviews})</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">Stock: {product.stockQuantity}</span>
            <span className="text-xs text-gray-400">{product.category}/{product.subCategory}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductSection = ({ title, products, emptyMessage }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              subtitle={`${product.category} • ${product.subCategory}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Create Top Products Report
      </button>

      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-lg font-semibold mb-4">Report Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Products
              </label>
              <input
                type="number"
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                className="w-full border rounded-md p-2"
                min="1"
                max="20"
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
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {reportData && (
        <div className="mt-6 space-y-6">
          <ProductSection 
            title="Top Products by Revenue" 
            products={reportData.topByRevenue}
            emptyMessage="No products found by revenue"
          />
          
          <ProductSection 
            title="Top Rated Products" 
            products={reportData.topRated}
            emptyMessage="No top rated products found"
          />
          
          <ProductSection 
            title="Recent Products" 
            products={reportData.recentProducts}
            emptyMessage="No recent products found"
          />
        </div>
      )}
    </div>
  );
};

export default TopProductsReport; 