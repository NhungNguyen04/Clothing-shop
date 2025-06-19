import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);
import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";

export default function ChartDashboard({ sellerId }) {
  const [pieData, setPieData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    setLoading(true);
    axiosInstance.get(`/products/seller/${sellerId}`)
      .then(res => {
        const products = res.data.data || [];
        const inStock = products.filter(p => p.stockQuantity > 0).length;
        const outOfStock = products.length - inStock;
        setPieData({
          labels: ["In Stock", "Out of Stock"],
          datasets: [
            {
              data: [inStock, outOfStock],
              backgroundColor: ["#22c55e", "#f43f5e"],
            },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, [sellerId]);

  if (loading) return <div className="text-center py-8">Loading chart...</div>;
  if (!pieData) return null;

  return (
    <div className="my-8">
      <div className="bg-white p-4 rounded shadow max-w-md mx-auto">
        <h3 className="text-center font-semibold mb-2">Product Stock Status</h3>
        <Pie data={pieData} />
      </div>
    </div>
  );
} 