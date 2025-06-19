import { useEffect, useState } from "react";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const readUserFromLocalStorage = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    // Read initial user state
    readUserFromLocalStorage();

    // Listen for changes in localStorage from other tabs/windows
    window.addEventListener("storage", readUserFromLocalStorage);

    // Clean up the event listener
    return () => {
      window.removeEventListener("storage", readUserFromLocalStorage);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, logout };
};

export default useAuth;