import axiosInstance from './axiosInstance';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AuthResult {
  success: boolean;
  data?: AuthResponse;
  error?: string;
}

export class AuthenticationService {
  /**
   * Register a new user
   */
  static async register(name: string, email: string, password: string): Promise<AuthResult> {
    try {
      const response = await axiosInstance.post('/users', {
        name,
        email,
        password,
      });

      const data = response.data;

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Registration failed'
        };
      }

      return {
        success: true,
        data: undefined
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'An error occurred during registration'
      };
    }
  }

  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      const data = response.data;

      if (!data.access_token) {
        return {
          success: false,
          error: data.message || 'Login failed'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'An error occurred during sign in'
      };
    }
  }

  /**
   * Login with Google OAuth (Web)
   */
  static async loginWithGoogle(): Promise<AuthResult> {
    return new Promise<AuthResult>((resolve) => {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const authUrl = `${axiosInstance.defaults.baseURL}/auth/google?platform=web&redirect_uri=${encodeURIComponent(redirectUri)}`;

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;

      const popup = window.open(
        authUrl,
        'GoogleAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'google-auth-callback') {
          window.removeEventListener('message', handleMessage);
          popup?.close();

          const { token, user } = event.data;
          let userData = user;
          if (!userData && token) {
            userData = AuthenticationService.extractUserFromToken(token);
          }
          if (token && userData) {
            resolve({
              success: true,
              data: {
                access_token: token,
                user: userData
              }
            });
          } else {
            resolve({
              success: false,
              error: 'Failed to complete authentication'
            });
          }
        }
      };

      window.addEventListener('message', handleMessage);
    });
  }

  /**
   * Extract user data from token
   */
  static extractUserFromToken(token: string): User | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name || 'User',
      };
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  }

  /**
   * Setup handler for authentication callbacks (Web)
   */
  static setupAuthCallbackHandler(callback: (data: AuthResponse) => void): () => void {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'google-auth-callback') {
        const { token, user } = event.data;
        let userData = user;
        if (!userData && token) {
          userData = AuthenticationService.extractUserFromToken(token);
        }
        if (token && userData) {
          callback({
            access_token: token,
            user: userData
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }
}

// This is for backward compatibility with existing code
export const AuthService = AuthenticationService;
