import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AuthError() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get error message from URL
    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get('error') || params.get('message') || 'Unknown error';
    
    // Show error message
    toast.error(`Authentication failed: ${decodeURIComponent(errorMessage)}`);
    
    // Redirect to login page after a delay
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
      <p className="text-red-500 mb-4">There was a problem with your Google authentication.</p>
      <p className="text-gray-600 mb-4">Redirecting you to the login page...</p>
      <button 
        onClick={() => navigate('/login')} 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Login
      </button>
    </div>
  );
}

export default AuthError;