import AdminLayout from "./components/AdminLayout";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import axiosInstance from "../../api/axiosInstance";
import useSeller from '../../hooks/useSeller';
import Spinner from '../../components/Spinner';

const Reviews = () => {
    const user = useAuth();
    const { seller, loading: sellerLoading } = useSeller();
    console.log('Reviews.jsx user:', user);
    const [reviews, setReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filterOption, setFilterOption] = useState("all"); // all, seller, product
    const [filterValue, setFilterValue] = useState("");

    useEffect(() => {
        let ignore = false;
        const fetch = async () => {
            setLoading(true);
            try {
                // Luôn gọi tất cả reviews cho admin
                if (user.user?.role === 'ADMIN') {
                    console.log('Fetching all reviews as admin');
                    await fetchAllReviews();
                } else if (!sellerLoading && seller?.id) {
                    console.log('Fetching seller reviews', seller.id);
                    await fetchReviewsSeller(seller.id);
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        fetch();
        return () => { ignore = true; };
    }, [user.user?.role, seller?.id, sellerLoading]);

    const fetchAllReviews = async () => {
        try {
            const response = await axiosInstance.get('/reviews');
            setReviews(response.data.data);
            setTotalReviews(response.data.data.length);
        } catch (error) {
            setReviews([]);
        }
    };

    const fetchReviewsSeller = async (sellerId) => {
        try {
            const url = `/reviews/seller/${sellerId}`;
            console.log('Calling API:', url);
            const response = await axiosInstance.get(url);
            setReviews(response.data.data);
            setTotalReviews(response.data.data.length);
        } catch (error) {
            setReviews([]);
        }
    };

    // FE filter logic
    const filteredReviews = reviews.filter(review => {
        const matchSearch = review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        if (user.user?.role === 'ADMIN') {
            if (filterOption === 'all') return matchSearch;
            if (filterOption === 'seller' && filterValue) return matchSearch && review.product?.sellerId === filterValue;
            if (filterOption === 'product' && filterValue) return matchSearch && review.productId === filterValue;
            return matchSearch;
        }
        return matchSearch;
    });

    // FE pagination
    const paginatedReviews = filteredReviews.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(filteredReviews.length / rowsPerPage);

    const handleDelete = (id) => {
        // TODO: implement delete review
    };

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-100 min-h-screen">
                {loading ? (
                    <div className="flex justify-center items-center h-96"><Spinner /></div>
                ) : (
                <>
                <div className="mb-4 flex flex-wrap gap-2 justify-end items-center">
                    {user.user?.role === 'ADMIN' && (
                        <div className="flex gap-2 items-center">
                            <select
                                value={filterOption}
                                onChange={e => { setFilterOption(e.target.value); setFilterValue(''); setCurrentPage(1); }}
                                className="p-2 border border-gray-300 rounded-md"
                            >
                                <option value="all">All reviews</option>
                                <option value="seller">By seller</option>
                                <option value="product">By product</option>
                            </select>
                            {(filterOption === 'seller' || filterOption === 'product') && (
                                <input
                                    type="text"
                                    placeholder={filterOption === 'seller' ? 'Seller ID...' : 'Product ID...'}
                                    className="p-2 border border-gray-300 rounded-md"
                                    value={filterValue}
                                    onChange={e => { setFilterValue(e.target.value); setCurrentPage(1); }}
                                />
                            )}
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="Search..."
                        className="p-2 border border-gray-300 rounded-md w-64"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    <select
                        value={rowsPerPage}
                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="p-2 border border-gray-300 rounded-md"
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
                            {paginatedReviews.map((review) => (
                                <tr key={review.id} className="border-b">
                                    <td className="p-3">{review.id}</td>
                                    <td className="p-3">{review.product?.name}</td>
                                    <td className="p-3">{review.user?.name}</td>
                                    <td className="p-3">
                                        {"\u2b50".repeat(review.rating)}{" "}
                                        <span className="text-gray-400">
                                            {"\u2606".repeat(5 - review.rating)}
                                        </span>
                                    </td>
                                    <td className="p-3">{review.date || review.reviewDate || review.createdAt}</td>
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
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-3 py-1 ${currentPage === index + 1 ? 'bg-pink-500 text-white' : 'border'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-3 py-1 border"
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
                </>
                )}
            </div>
        </AdminLayout>
    );
};

export default Reviews;
