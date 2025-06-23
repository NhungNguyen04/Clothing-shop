// This file is maintained for backwards compatibility
// New code should import from '../context/AuthContext' directly
import { useAuth as newUseAuth } from '../context/AuthContext';

const useAuth = () => {
  // Call the new hook from AuthContext
  return newUseAuth();
};

export default useAuth;