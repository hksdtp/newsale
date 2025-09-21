import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { authService, User } from '../../features/auth/api/authService';
import { authContextService } from '../../services/authContextService';

// Types - Use the User interface from authService
type AuthUser = User;

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  getUsers: () => Promise<User[]>;
  needsPasswordChange: (email: string) => Promise<boolean>;
  changePassword: (email: string, currentPassword: string, newPassword: string) => Promise<void>;
}

// Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading to check persisted session
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for persisted session on mount
  useEffect(() => {
    const checkPersistedSession = async () => {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);

          // Set user context in authContextService
          await authContextService.setUserContext(user.id);

          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          return;
        } catch (error) {
          console.error('Error restoring user session:', error);
          localStorage.removeItem('auth_user');
          localStorage.removeItem('currentUserId');
        }
      }
      // Set loading to false if no saved session
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    checkPersistedSession();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const user = await authService.login({ email, password });

      // Persist user session
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('currentUserId', user.id);

      // Set user context in authContextService
      await authContextService.setUserContext(user.id);

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error instanceof Error ? error.message : 'Đăng nhập thất bại',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();

      // Clear user context
      await authContextService.clearUserContext();

      // Clear localStorage
      localStorage.removeItem('auth_user');
      localStorage.removeItem('currentUserId');

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still dispatch logout even if there's an error
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const getUsers = async () => {
    return await authService.getUsers();
  };

  const needsPasswordChange = async (email: string) => {
    return await authService.needsPasswordChange(email);
  };

  const changePassword = async (email: string, currentPassword: string, newPassword: string) => {
    await authService.changePassword({ email, currentPassword, newPassword });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    getUsers,
    needsPasswordChange,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
