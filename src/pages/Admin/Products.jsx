import { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/ProductForm";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProductList() {
    const [isOpen, setIsOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const uploadImage = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axiosInstance.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        } catch (error) {
            console.error("Upload failed", error);
            return null;
        }
    };

    const uploadMultipleImages = async (files) => {
        if (!files.length) return [];

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        try {
            const response = await axiosInstance.post("/upload/multiple", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        } catch (error) {
            console.error("Upload failed", error);
            return [];
        }
    };

    const onSubmit = async (data) => {
        setIsAdding(true);
        try {
            const formattedStockSize = Object.entries(data.sizeStock).map(([size, quantity]) => ({
                size,
                quantity,
            }));

            const mainImageUrl = await uploadImage(data.mainImage);
            const subImagesUrls = await uploadMultipleImages(data.subImages);

            if (!mainImageUrl) throw new Error("Failed to upload main image");
            if (data.subImages.length && subImagesUrls.length !== data.subImages.length)
                throw new Error("Some sub-images failed to upload");

            const newProduct = {
                ...data,
                stockSize: formattedStockSize,
                price: parseFloat(data.price),
                image: [mainImageUrl, ...subImagesUrls],
                sellerId: 'cm88bhi8o0003210v06m2sy8a'
            };

            const response = await axiosInstance.post("/products", newProduct);
            setProducts((prev) => [response.data.data, ...prev]);

            toast.success("Thêm sản phẩm mới thành công! 🎉", { position: "top-right" });
            setIsOpen(false);
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("Lỗi khi tạo sản phẩm mới ❌", { position: "top-right" });
        } finally {
            setIsAdding(false);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get("/products");
                setProducts(response.data.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <AdminLayout>
            <ToastContainer />
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-semibold">Products List</h2>
                        <p className="text-gray-500">Manage your products easily.</p>
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
                {isOpen && (
                    <ProductForm isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={onSubmit} />
                )}
                
                {isAdding && (
                    <div className="flex justify-center mt-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
                    </div>
                )}

                <div>
                    <ProductTable data={products} />
                </div>
            </div>
        </AdminLayout>
    );
}
