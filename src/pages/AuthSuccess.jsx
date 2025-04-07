import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AuthSuccess() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the token from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store the token in localStorage
      localStorage.setItem('authToken', token);

      // Parse JWT to get user information
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          image: payload.picture,
          name: payload.name.replace('undefined', '').trim(),
        };
        localStorage.setItem('user', JSON.stringify(user));
        
        navigate('/');
        window.location.reload();
      } catch (error) {
        console.error('Error parsing JWT token', error);
        toast.error('Authentication successful but there was a problem with your session.');
        navigate('/login');
      }
    } else {
      // No token found
      toast.error('Authentication failed: No token received');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Authentication Successful</h1>
      <p className="text-gray-600 mb-4">Redirecting you to home page...</p>
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}

export default AuthSuccess;