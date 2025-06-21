import { useState } from "react";
import { FaEdit, FaEllipsisV, FaTrash } from "react-icons/fa";
import AdminLayout from "./components/AdminLayout";

const categories = [
  { id: 21, name: "Men clothes", description: "Men clothes", slug: "/men", order: 1 },
  { id: 2, name: "Women fashion", description: "Fashions for Women", slug: "/women", order: 2 },
  { id: 3, name: "Kids clothes", description: "Clothes for kids", slug: "/kids", order: 3 },
  { id: 4, name: "Hot Gifts", description: "Hot Gifts", slug: "/gifts", order: 4 },
  { id: 5, name: "Electronics", description: "Electronics", slug: "/electr", order: 5 },
  { id: 6, name: "Accessories", description: "Accessories", slug: "/accessories", order: 6 },
  { id: 7, name: "Jewellery", description: "Jewellery", slug: "/jewel", order: 7 },
  { id: 8, name: "Interiors", description: "Interiors", slug: "/interior", order: 8 },
];

export default function CategoryPage() {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  return (
    <AdminLayout>
        <div className="p-6 mx-auto flex">
            
            <div className="flex flex-col w-1/3 mr-8">
                <h1 className="text-3xl font-semibold">Categories</h1>
                <p className="text-gray-500">Add, edit or delete a category</p>
                <input type="text" placeholder="Name" className="p-2 my-4 border rounded" />
                <input type="text" placeholder="Slug" className="p-2 my-4 border rounded" />
                <select className="p-2 border rounded my-4">
                    <option>Clothes</option>
                    <option>T-Shirts</option>
                </select>
                <textarea placeholder="Description" className="p-2 my-4 border rounded col-span-3"></textarea>
                <button className="bg-green-600 text-white p-2 rounded col-span-3">Create category</button>
            </div>
            
            <div className="mt-6 bg-white shadow rounded-md p-4 w-2/3">
                <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                    <th className="p-3">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Slug</th>
                    <th className="p-3">Order</th>
                    <th className="p-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                    <tr key={category.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 text-center">{category.id}</td>
                        <td className="p-3">{category.name}</td>
                        <td className="p-3">{category.description}</td>
                        <td className="p-3">{category.slug}</td>
                        <td className="p-3 text-center">{category.order}</td>
                        <td className="p-3 text-center relative">
                        <button onClick={() => setDropdownOpen(dropdownOpen === category.id ? null : category.id)}
                            className="p-2 rounded hover:bg-gray-200">
                            <FaEllipsisV />
                        </button>
                        {dropdownOpen === category.id && (
                            <div className="absolute right-5 bg-white border border-gray-200 shadow-md rounded-lg w-32 z-20">
                                <button className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left">
                                    <FaEdit className="mr-2 text-pink-500" /> Edit
                                </button>
                                <button className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600">
                                    <FaTrash className="mr-2" /> Delete
                                </button>
                            </div>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
    </AdminLayout>
  );
}
