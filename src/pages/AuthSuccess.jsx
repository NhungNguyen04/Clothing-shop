import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function AuthSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Prevent multiple executions
    let isProcessing = false;
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Authentication timeout - taking too long");
        setError("Authentication timeout - please try again");
        setLoading(false);
        toast.error("Authentication took too long - please try again");
        navigate('/login', { replace: true });
      }
    }, 15000); // 15 second timeout
    
    const processAuth = async () => {
      if (isProcessing) return;
      isProcessing = true;
      
      try {
        // Log all URL parameters for debugging
        const allParams = {};
        const params = new URLSearchParams(window.location.search);
        params.forEach((value, key) => {
          allParams[key] = value;
        });
        
        console.log("Auth success page loaded with URL params:", allParams);
        setDebugInfo(prev => ({ ...prev, urlParams: allParams }));
        
        // Get the token from URL query parameters
        const token = params.get('token');
        
        console.log("Auth token received:", token ? "Token exists" : "No token found");

        if (!token) {
          const errorMsg = "No authentication token received";
          setError(errorMsg);
          setDebugInfo(prev => ({ 
            ...prev, 
            error: errorMsg,
            fullUrl: window.location.href
          }));
          
          toast.error("Authentication failed: No token received");
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        try {
          // Decode the token to get user info
          const payload = parseJwt(token);
          console.log("Token payload:", payload);
          
          setTokenData(payload);
          setDebugInfo(prev => ({ ...prev, tokenPayload: payload }));

          // Construct user object from token payload - match your backend user structure
          const user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name || "User",
            image: payload.picture,
            role: payload.role || "USER"
          };

          console.log("User object constructed:", user);
          setDebugInfo(prev => ({ ...prev, userObject: user }));

          // Login the user using the context
          const loginResult = await login({
            user,
            access_token: token
          });
          
          console.log("Login result:", loginResult);
          setDebugInfo(prev => ({ ...prev, loginResult }));

          // Check if login was successful (AuthContext login returns { success: true/false })
          if (loginResult && loginResult.success === false) {
            throw new Error(loginResult.error || "Login failed");
          }
          
          // If we get here, login was successful
          toast.success("Successfully authenticated with Google");
          // Clear the URL parameters to prevent re-processing
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/', { replace: true });
        } catch (decodingError) {
          console.error("Error decoding token:", decodingError);
          setError("Failed to decode authentication token");
          setDebugInfo(prev => ({ ...prev, decodingError: decodingError.message }));
          
          toast.error("Authentication error: Invalid token format");
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setError(error.message);
        setDebugInfo(prev => ({ ...prev, errorDetails: error.message }));
        
        toast.error(`Authentication error: ${error.message}`);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    processAuth();
    
    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array to run only once

  // Function to parse JWT token with better error handling
  const parseJwt = (token) => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Token is not a valid string');
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error(`Token must have 3 parts, but has ${parts.length}`);
      }
      
      const base64Url = parts[1];
      if (!base64Url) {
        throw new Error('Token payload part is empty');
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      let jsonPayload;
      try {
        jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch (decodeError) {
        console.error('Base64 decode error:', decodeError);
        throw new Error('Failed to decode token payload');
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonPayload);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Token payload is not valid JSON');
      }
      
      console.log('Successfully parsed JWT payload:', parsed);
      return parsed;
    } catch (error) {
      console.error("Error parsing JWT token:", error);
      console.error("Token:", token);
      throw new Error(`Invalid token format: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication {error ? 'Failed' : 'Successful'}</h1>
      
      {loading ? (
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 mb-4"></div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-gray-600 mb-4">Redirecting to login page...</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-green-500 mb-4">Authentication successful!</p>
          <p className="text-gray-600 mb-4">Redirecting to home page...</p>
        </div>
      )}
      
      {/* Debug information - useful for troubleshooting */}
      <div className="mt-8 p-4 bg-gray-100 rounded w-full max-w-lg">
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold text-sm">Debug Information:</p>
          <button 
            onClick={() => navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))}
            className="px-2 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600"
          >
            Copy Debug Info
          </button>
        </div>
        
        <p className="text-xs mb-1 font-semibold">Current URL:</p>
        <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-20 mb-2 bg-gray-200 p-1 rounded">
          {window.location.href}
        </pre>
        
        {tokenData && (
          <>
            <p className="text-xs mb-1 font-semibold">Token Payload:</p>
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40 mb-2 bg-gray-200 p-1 rounded">
              {JSON.stringify(tokenData, null, 2)}
            </pre>
          </>
        )}
        
        <p className="text-xs mb-1 font-semibold">Debug Details:</p>
        <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40 bg-gray-200 p-1 rounded">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default AuthSuccess;