import { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/ProductForm";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSeller from "../../hooks/useSeller";


export default function ProductList() {
    const [isOpen, setIsOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [initialData, setInitialData] = useState({})
    const {seller} = useSeller()


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
            console.log(data)
            delete data.sizes
            const formattedStockSize = Object.entries(data.sizeStock).map(([size, quantity]) => ({
                size,
                quantity,
            }));
            delete data.sizeStock

            const mainImageUrl = initialData?.image?.length > 0 ? initialData?.image[0] : await uploadImage(data.mainImage);
            const subImagesUrls = initialData?.image?.length > 0 ? initialData?.image?.slice(1,5) :  await uploadMultipleImages(data.subImages);

            const newProduct = {
                ...data,
                stockSize: formattedStockSize,
                price: parseFloat(data.price),
                image: [mainImageUrl, ...subImagesUrls],
                sellerId: seller?.id
            };
            console.log(newProduct)
            let response;
            if (Object.keys(initialData).length > 0 ) {
                response = await axiosInstance.patch(`/products/${initialData.id}`, newProduct);
                toast.success("Cập nhật sản phẩm thành công! ✨", { position: "top-right" });
            } else {                response = await axiosInstance.post("/products", newProduct);
                toast.success("Thêm sản phẩm mới thành công! 🎉", { position: "top-right" });
            }

            setProducts((prev) => {
                if (Object.keys(initialData).length > 0 ) return prev.map((product) => (product.id === initialData.id ? response.data.data : product)) 
                else return [response.data.data, ...prev];
            });
            setIsOpen(false);
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("Lỗi khi thực hiện hành động ❌", { position: "top-right" });
        } finally {
            setIsAdding(false);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if(seller?.id) {
                    console.log(seller?.id)
                    const response = await axiosInstance.get(`/products/seller/${seller?.id}`);
                    setProducts(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [seller?.id]);

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
                            onClick={() => {setIsOpen(true); setInitialData({})}}
                        >
                            Create new
                        </button>
                    </div>
                </div>
                {isOpen && (
                    <ProductForm isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={onSubmit} initialData = {initialData} />
                )}
                
                {isAdding && (
                    <div className="flex justify-center mt-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
                    </div>
                )}

                <div>
                    <ProductTable setInitialData = {setInitialData} setIsOpen={setIsOpen} data={products} />
                </div>
            </div>
        </AdminLayout>
    );
}
