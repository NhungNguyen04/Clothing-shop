import { useState } from "react";
import AdminLayout from "./components/AdminLayout";

export default function ProductList() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AdminLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                <h2 className="text-2xl font-semibold">Products List</h2>
                <p className="text-gray-500">Lorem ipsum dolor sit amet.</p>
                </div>
                <div className="flex space-x-2">
                <button className="border px-4 py-2 rounded text-gray-700">Export</button>
                <button className="border px-4 py-2 rounded text-gray-700">Import</button>
                <button
                    className="bg-teal-700 text-white px-4 py-2 rounded"
                    onClick={() => setIsOpen(true)}
                >
                    Create new
                </button>
                </div>
            </div>

            {/* Modal for Adding Product */}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white p-6 rounded shadow-lg w-1/3">
                    <h3 className="text-xl font-semibold mb-4">Add Product</h3>
                    <form className="space-y-4">
                    <input
                        type="text"
                        placeholder="Product Name"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        className="w-full p-2 border rounded"
                    />
                    <textarea
                        placeholder="Description"
                        className="w-full p-2 border rounded"
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                        <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={() => setIsOpen(false)}
                        >
                        Cancel
                        </button>
                        <button
                        type="submit"
                        className="px-4 py-2 bg-teal-700 text-white rounded"
                        >
                        Save
                        </button>
                    </div>
                    </form>
                </div>
                </div>
            )}
        </div>
    </AdminLayout>
  );
}
