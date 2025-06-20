import { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/ProductForm";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSeller from "../../hooks/useSeller";
import Spinner from "../../components/Spinner";
import useAuth from "../../hooks/useAuth";


export default function ProductList() {
    const [isOpen, setIsOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [initialData, setInitialData] = useState({})
    const {seller, loading: sellerLoading, error: sellerError} = useSeller()
    const {user} = useAuth()
    const [isDeleting, setIsDeleting] = useState(false);


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
            console.log("Form Data:", data);
            console.log("Main Image Data:", data.mainImage);
            console.log("Sub Images Data:", data.subImages);
            delete data.sizes
            const formattedStockSize = Object.entries(data.sizeStock).map(([size, quantity]) => ({
                size,
                quantity,
            }));
            delete data.sizeStock

            const mainImageUrl = initialData?.image?.length > 0 ? initialData?.image[0] : await uploadImage(data.mainImage);
            const subImagesUrls = initialData?.image?.length > 0 ? initialData?.image?.slice(1,5) :  await uploadMultipleImages(data.subImages);

            const combinedImages = [mainImageUrl, ...subImagesUrls].filter(Boolean);

            const newProduct = {
                ...data,
                stockSize: formattedStockSize,
                price: parseFloat(data.price),
                image: combinedImages.length > 0 ? combinedImages : ["https://via.placeholder.com/150"],
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

    const handleExport = async () => {
        try {
            const response = await axiosInstance.get(`/products/export?sellerId=${seller?.id}` , {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products.xlsx'); // or products.csv
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Sản phẩm đã được xuất ra file Excel!", { position: "top-right" });
        } catch (error) {
            console.error("Error exporting products:", error);
            toast.error("Lỗi khi xuất sản phẩm ra file Excel ❌", { position: "top-right" });
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axiosInstance.post('/products/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.success) {
                toast.success("Sản phẩm đã được nhập từ file Excel!", { position: "top-right" });
                // Reload product list after successful import
                if (seller?.id) {
                    const res = await axiosInstance.get(`/products/seller/${seller?.id}`);
                    setProducts(res.data.data);
                }
            } else {
                toast.error("Lỗi khi nhập sản phẩm từ file Excel ❌", { position: "top-right" });
            }
        } catch (error) {
            console.error("Error importing products:", error);
            toast.error("Lỗi khi nhập sản phẩm từ file Excel ❌", { position: "top-right" });
        } finally {
            // Clear the input value so the same file can be selected again if needed
            event.target.value = null;
        }
    };

    // Hàm reload lại danh sách sản phẩm
    const reloadProducts = async () => {
        setLoading(true);
        try {
            if(seller?.id) {
                const response = await axiosInstance.get(`/products/seller/${seller?.id}`);
                setProducts(response.data.data);
            }
        } catch (err) {
            setError("Failed to reload products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if(seller?.id) {
                    console.log('Fetching products for seller:', seller?.id);
                    const response = await axiosInstance.get(`/products/seller/${seller?.id}`);
                    setProducts(response.data.data);
                    console.log('Products fetched:', response.data.data);
                } else if (!sellerLoading && !seller?.id) {
                    console.log("No seller ID available after seller hook loaded.");
                    setError("No seller information found.");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
                console.log('ProductList loading set to false.');
            }
        };

        if (!sellerLoading) {
            fetchProducts();
        }
    }, [seller?.id, sellerLoading]);

    if (loading || sellerLoading) return <Spinner />;
    if (error || sellerError) return <p className="text-center text-red-500">{error || sellerError}</p>;

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
                        <button className="border px-4 py-2 rounded text-gray-700" onClick={handleExport}>Export</button>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            className="hidden"
                            id="import-file-input"
                            onChange={handleImport}
                        />
                        <button
                            className="border px-4 py-2 rounded text-gray-700"
                            onClick={() => document.getElementById('import-file-input').click()}
                        >
                            Import
                        </button>
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
                        <Spinner />
                    </div>
                )}

                {isDeleting && (
                    <div className="flex justify-center mt-4">
                        <Spinner />
                    </div>
                )}

                <div>
                    <ProductTable setInitialData={setInitialData} setIsOpen={setIsOpen} data={products} onDelete={async (id) => {
                        setIsDeleting(true);
                        await reloadProducts();
                        setIsDeleting(false);
                    }} />
                </div>
            </div>
        </AdminLayout>
    );
}
