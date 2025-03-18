import AdminLayout from "./components/AdminLayout";

const reviews = [
  { id: 23, product: "A-Line Mini Dress in Blue", name: "Devon Lane", rating: 4, date: "10.03.2022" },
  { id: 24, product: "Fashion Woman Bag", name: "Guy Hawkins", rating: 3, date: "04.12.2019" },
  { id: 25, product: "Air Jordan 1 Top 3 Sneaker (DS)", name: "Savannah Nguyen", rating: 5, date: "25.05.2022" },
  { id: 26, product: "Samsung Galaxy S20", name: "Kristin Watson", rating: 5, date: "01.06.2022" },
  { id: 27, product: "Macbook Pro 16 inch (2022)", name: "Jane Cooper", rating: 4, date: "13.03.2022" },
];

const   Reviews = () => {
  return (
    <AdminLayout>
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Reviews</h1>
                <input
                type="text"
                placeholder="Search..."
                className="p-2 border border-gray-300 rounded-md w-64"
                />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-200">
                    <th className="p-3 text-left">#ID</th>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Rating</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review) => (
                    <tr key={review.id} className="border-b">
                        <td className="p-3">{review.id}</td>
                        <td className="p-3">{review.product}</td>
                        <td className="p-3">{review.name}</td>
                        <td className="p-3">
                        {"⭐".repeat(review.rating)}{" "}
                        <span className="text-gray-400">
                            {"☆".repeat(5 - review.rating)}
                        </span>
                        </td>
                        <td className="p-3">{review.date}</td>
                        <td className="p-3">
                        <button className="bg-green-500 text-white px-4 py-1 rounded-md">
                            Detail
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
                <button className="px-3 py-1 bg-blue-500 text-white rounded-md">1</button>
                <button className="px-3 py-1 border rounded-md">2</button>
                <button className="px-3 py-1 border rounded-md">3</button>
                <button className="px-3 py-1 border rounded-md">Next</button>
            </div>
            </div>
    </AdminLayout>
  );
};

export default Reviews;
