// Web version of OAuth service for handling Google authentication
import axiosInstance from '../api/axiosInstance';

const API_URL = "https://clothing-shop-be-5eol.onrender.com";

export class AuthService {
  /**
   * Initiates Google OAuth login flow in browser environment
   */
  static async loginWithGoogle(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log("Starting Google login flow...");
      
      // For web, we'll redirect directly to Google auth endpoint
      // The backend will redirect back to our auth-success page
      
      // According to backend controller, we need:
      // 1. platform=web parameter
      // 2. redirect_uri parameter (not return_to)
      const redirectUri = `${window.location.origin}/auth-success`;
      console.log("Redirect URI:", redirectUri);
      
      // Build the URL with the correct parameters as expected by the backend
      const authUrl = `${API_URL}/auth/google?platform=web&redirect_uri=${encodeURIComponent(redirectUri)}`;
      console.log("Auth URL:", authUrl);
      
      // Redirect the user to Google OAuth
      window.location.href = authUrl;
      
      return {
        success: true,
        data: {
          message: "Redirecting to Google authentication..."
        }
      };
    } catch (error) {
      console.error("Google login error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Authentication failed" 
      };
    }
  }

  /**
   * Parse a JWT token to extract its payload
   */
  static parseJwt(token: string): any {
    try {
      // Basic validation
      if (!token || typeof token !== 'string' || !token.includes('.')) {
        throw new Error('Invalid token format');
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token must have 3 parts');
      }
      
      // Extract the payload part (middle part)
      const base64Url = parts[1];
      // Replace characters that are URL-specific
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Decode the base64
      let jsonPayload;
      try {
        // Decode and convert to JSON
        jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
      } catch (error) {
        console.error('Error decoding base64:', error);
        throw new Error('Failed to decode token payload');
      }
      
      // Parse the JSON
      try {
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error('Error parsing JSON payload:', error);
        throw new Error('Invalid JSON in token payload');
      }
    } catch (error) {
      console.error("Error parsing JWT token:", error);
      throw error;
    }
  }
}

