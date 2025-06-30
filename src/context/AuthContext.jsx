import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";
import { getSellerByUserId } from "../services/seller";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setSeller = useAuthStore((state) => state.setSeller);
  const isSeller = useAuthStore((state) => state.isSeller);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem("userToken");
        const storedUser = localStorage.getItem("userData");

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (error) {
        console.log("Failed to load auth data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (user && token) {
        setAuth(user, token);
      } else {
        clearAuth();
      }
    }
  }, [user, token, isLoading, setAuth, clearAuth]);

  const checkSellerStatus = async (userId) => {
    try {
      const response = await getSellerByUserId(userId);

      if (response.success && response.data && response.data.seller) {
        setSeller(response.data.seller);

        if (response.data.seller.status === "APPROVED") {
          navigate("/seller/dashboard");
        }
      } else {
        setSeller(null);
      }
    } catch (error) {
      setSeller(null);
    }
  };

  const handleAdminRedirect = (user) => {
    if (user.role === 'ADMIN') {
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 100);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      if (user.role === 'SELLER') {
        checkSellerStatus(user.id);
      } else if (user.role === 'ADMIN') {
        handleAdminRedirect(user);
      }
    }
  }, [user]);

  const login = async (data) => {
    try {
      console.log('AuthContext: Login called with data:', data);
      
      // Validate required data
      if (!data.user || !data.access_token) {
        console.error('AuthContext: Missing user or access_token in login data', data);
        throw new Error('Invalid login data: missing user or token');
      }
      
      // Store auth data in localStorage
      localStorage.setItem('userToken', data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      console.log('AuthContext: Auth data stored in localStorage');

      // Update local state
      setToken(data.access_token);
      setUser(data.user);
      console.log('AuthContext: Local state updated with user and token');
      
      // Update the auth store
      setAuth(data.user, data.access_token);
      console.log('AuthContext: Auth store updated with user and token');

      if (data.user.role === 'SELLER' && data.user.id) {
        console.log('AuthContext: User is a seller, checking seller status');
        checkSellerStatus(data.user.id);
      } else if (data.user.role === 'ADMIN') {
        console.log('AuthContext: User is an admin, redirecting to admin page');
        setTimeout(() => {
          handleAdminRedirect(data.user);
        }, 100);
      }
      
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Failed to store auth data', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logout called');
      
      // Remove data from localStorage
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      console.log('AuthContext: Auth data removed from localStorage');

      // Update local state
      setToken(null);
      setUser(null);
      console.log('AuthContext: Local state cleared');
      
      // Clear the auth store
      clearAuth();
      console.log('AuthContext: Auth store cleared');
      
      return { success: true };
    } catch (error) {
      console.error("AuthContext: Failed to remove auth data", error);
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isSeller,
        isAdmin,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
