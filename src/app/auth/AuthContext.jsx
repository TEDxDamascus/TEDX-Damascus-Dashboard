import { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { tokenService } from '../services/tokenService';
import { login as authLogin } from '../services/authService';
import { setUser, logout as logoutAction } from './store/userSlice';

const ALLOWED_ROLES = ['superadmin', 'admin'];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleForcedLogout = () => {
      dispatch(logoutAction());
      navigate('/sign-in', { replace: true });
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [dispatch, navigate]);

  const signIn = async (email, password) => {
    const { data } = await authLogin(email, password);
    const { access_token, refresh_token } = data;

    tokenService.setTokens({ access_token, refresh_token });
    const tokenUser = tokenService.getUserFromToken();

    if (!ALLOWED_ROLES.includes(tokenUser?.role)) {
      tokenService.clearTokens();
      throw new Error('Access denied. Only administrators can access this dashboard.');
    }

    dispatch(setUser(tokenUser));
    navigate('/events');
  };

  const logout = () => {
    tokenService.clearTokens();
    dispatch(logoutAction());
    enqueueSnackbar('Logged out', { variant: 'info' });
    navigate('/sign-in', { replace: true });
  };

  return <AuthContext.Provider value={{ signIn, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
