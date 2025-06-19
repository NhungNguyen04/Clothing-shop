import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "./useAuth";

const useSeller = () => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {user} = useAuth();

  useEffect(() => {
    const fetchSeller = async () => {
      if (!user?.id) return;
      try {
        const response = await axiosInstance.get(`/sellers/user/${user.id}`);
        setSeller(response.data.seller || null);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin người bán:", err);
        setError("Không thể lấy thông tin người bán.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [user]);

  return { seller, loading, error };
};

export default useSeller;
