import { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Helper function to format date to 'yyyy-MM-dd'
const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueReport = ({ sellerId }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        startDate: formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1))), // Default to one month ago
        endDate: formatDate(new Date()),
        groupBy: 'day',
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async () => {
        setLoading(true);
        setReportData(null);
        try {
            const params = { ...filters };
            const response = await axiosInstance.get(`/seller-report/${sellerId}/revenue`, { params });
            setReportData(response.data);
        } catch (error) {
            console.error('Error generating revenue report:', error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: reportData?.revenueByPeriod?.map(d => new Date(d.period).toLocaleDateString()) || [],
        datasets: [
            {
                label: 'Total Revenue',
                data: reportData?.revenueByPeriod?.map(d => d.revenue) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="space-y-4">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
                Create Revenue Report
            </button>

            {showFilters && (
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Report Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="w-full border rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="w-full border rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                            <select
                                value={filters.groupBy}
                                onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                                className="w-full border rounded-md p-2"
                            >
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                            </select>
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
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}

            {reportData && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow-md space-y-6">
                    <div>
                        <p className="text-lg font-semibold text-center text-gray-700">Total Revenue</p>
                        <p className="text-4xl font-bold text-center text-green-600">${reportData.totalRevenue.toLocaleString()}</p>
                    </div>

                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Revenue by ' + filters.groupBy } } }} />

                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Top Selling Products</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {reportData.topSellingProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img src={product.image[0]} alt={product.name} className="h-12 w-12 rounded-md object-cover mr-4" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${product.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.stockQuantity}
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
                </div>
            )}
        </div>
    );
};

export default RevenueReport; 