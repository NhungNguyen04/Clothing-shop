import { useState } from "react";
import AdminLayout from "./components/AdminLayout";

const allProducts = [
  { id: 1, name: "Mushroom Shirt", price: "$179.00", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/2.jpg" },
  { id: 2, name: "Abstract Shirt", price: "$179.00", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/2.jpg" },
  { id: 3, name: "Floral Green Shirt", price: "$179.00", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/2.jpg" },
  { id: 4, name: "Vintage Floral Shirt", price: "$179.00", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/2.jpg" },
  { id: 5, name: "Cherry Blossom Shirt", price: "$179.00", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/2.jpg" },
  { id: 6, name: "Colorful Sandals", price: "$179.00", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/2.jpg" },
  { id: 7, name: "Denim Jacket", price: "$249.00", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/2.jpg" },
  { id: 8, name: "Casual Sneakers", price: "$199.00", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/2.jpg" },
  { id: 9, name: "Elegant Dress", price: "$299.00", image: "https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/items/2.jpg" },
];

const PRODUCTS_PER_PAGE = 8;

const SellerProfile = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);

  const currentProducts = allProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <AdminLayout>
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="bg-white shadow-lg rounded-lg mx-auto">
          <div className="relative bg-blue-600 h-36 flex justify-center items-center">
            <img
              src="https://wp.alithemes.com/html/evara/evara-backend/assets/imgs/brands/brand-3.jpg"
              alt="Logo"
              className="absolute bottom-[-40px] w-24 h-24 rounded-lg shadow-lg"
            />
          </div>
          <div className="pt-16 text-center">
            <h1 className="text-2xl font-bold">Cocorico Sports Shop</h1>
            <p className="text-gray-600">3891 Ranchview Dr. Richardson, California 62639</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Total sales:</p>
              <p className="text-lg font-bold text-green-700">238</p>
              <p className="text-sm text-gray-600 mt-2">Revenue:</p>
              <p className="text-lg font-bold text-green-700">$2380</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-md font-semibold">Contacts</p>
              <p className="text-gray-700">Manager: Jerome Bell</p>
              <p className="text-blue-600">info@example.com</p>
              <p className="text-gray-700">(229) 555-0109; (808) 555-0111</p>
            </div>
            <div className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p className="text-md font-semibold">Address</p>
                <p className="text-gray-700">Country: California</p>
                <p className="text-gray-700">Address: Ranchview Dr. Richardson</p>
                <p className="text-gray-700">Postal code: 62639</p>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold px-6 mt-6">Products by seller</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-md flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              >
                <img src={product.image} alt={product.name} className="w-fit object-cover" />
                <h3 className="mt-2 text-lg font-medium">{product.name}</h3>
                <p className="text-gray-700">{product.price}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 py-6">
              <button
                className={`px-4 py-2 border rounded ${
                  currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-white hover:bg-gray-200"
                }`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 border rounded ${
                    currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200"
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className={`px-4 py-2 border rounded ${
                  currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-white hover:bg-gray-200"
                }`}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SellerProfile;
