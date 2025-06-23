import AdminLayout from "./components/AdminLayout";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import axiosInstance from "../../api/axiosInstance";

const Reviews = () => {
    const user = useAuth();
    const [reviews, setReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(false); // State to manage loading

    useEffect(() => {
        fetchReviews();
    }, [user?.idSeller]);

    const fetchReviews = async () => {
        try {
            const response = await axiosInstance.get(`/reviews/seller/${user?.idSeller}`);
            setReviews(response.data.data);
            setTotalReviews(response.data.data.length);
            await handlePageChange(1, rowsPerPage);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const handlePageChange = async (page, rowsPerPage) => {
        setLoading(true);
        setCurrentPage(page);
        const response = await axiosInstance.get(`/reviews/seller/${user?.idSeller}?page=${page}&limit=${rowsPerPage}`);
        setReviews(response.data.data);
        setLoading(false);
    };

    const handleRowsPerPageChange = async (limit) => {
        setRowsPerPage(limit);
        await handlePageChange(1, limit);
    };

    const filteredReviews = reviews.filter(review =>
        review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        console.log(`Delete review with id: ${id}`);
    };

    const totalPages = Math.ceil(totalReviews / rowsPerPage);

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-100 min-h-screen">
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">Reviews</h1>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="p-2 border border-gray-300 rounded-md w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        value={rowsPerPage}
                        onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                        className="p-2 border border-gray-300 rounded-md ml-4"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                    </select>
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
                                <th className="p-3 text-left">Comment</th>
                                <th className="p-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReviews.map((review) => (
                                <tr key={review.id} className="border-b">
                                    <td className="p-3">{review.id}</td>
                                    <td className="p-3">{review.product.name}</td>
                                    <td className="p-3">{review.user.name}</td>
                                    <td className="p-3">
                                        {"⭐".repeat(review.rating)}{" "}
                                        <span className="text-gray-400">
                                            {"☆".repeat(5 - review.rating)}
                                        </span>
                                    </td>
                                    <td className="p-3">{review.date}</td>
                                    <td className="p-3">{review.comment}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleDelete(review.id)} className="text-red-500 ml-2">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index + 1, rowsPerPage)}
                            className={`px-3 py-1 ${currentPage === index + 1 ? 'bg-pink-500 text-white' : 'border'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1, rowsPerPage)}
                        className="px-3 py-1 border"
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
                {loading && (
                    <div className="absolute top-0 left-0 flex justify-center items-center h-screen w-full bg-white">
                        <div className="flex flex-row gap-2">
                            <div className="w-4 h-4 rounded-full bg-black animate-bounce"></div>
                            <div className="w-4 h-4 rounded-full bg-black animate-bounce [animation-delay:-.3s]"></div>
                            <div className="w-4 h-4 rounded-full bg-black animate-bounce [animation-delay:-.5s]"></div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Reviews;
