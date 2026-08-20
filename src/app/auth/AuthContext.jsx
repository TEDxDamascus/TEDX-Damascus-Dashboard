import { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { tokenService } from '../services/tokenService';
import { adminLogin, fetchMyProfile } from '../services/authService';
import { setUser, logout as logoutAction } from './store/userSlice';

const ALLOWED_ROLES = ['superadmin', 'admin'];

/** Prefer the first non-empty permissions array. */
function pickPermissions(...sources) {
  for (const src of sources) {
    if (Array.isArray(src) && src.length > 0) return src;
  }
  // Fall back to first array (even empty) so callers always get an array
  for (const src of sources) {
    if (Array.isArray(src)) return src;
  }
  return [];
}

function buildSessionUser({ tokenUser, loginUser, profile }) {
  const id =
    profile?.id ||
    profile?._id ||
    loginUser?.id ||
    loginUser?._id ||
    tokenUser?.id;

  const isActive =
    typeof profile?.isActive === 'boolean'
      ? profile.isActive
      : typeof profile?.is_active === 'boolean'
        ? profile.is_active
        : typeof loginUser?.isActive === 'boolean'
          ? loginUser.isActive
          : typeof loginUser?.is_active === 'boolean'
            ? loginUser.is_active
            : (tokenUser?.isActive ?? true);

  return {
    id,
    name: profile?.name || loginUser?.name || tokenUser?.name || '',
    email: profile?.email || loginUser?.email || tokenUser?.email || '',
    role: profile?.role || loginUser?.role || tokenUser?.role || null,
    isActive,
    // Login body often omits permissions — merge JWT + /users/me + login.user
    permissions: pickPermissions(
      profile?.permissions,
      loginUser?.permissions,
      tokenUser?.permissions,
    ),
  };
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleForcedLogout = () => {
      dispatch(logoutAction());
      enqueueSnackbar('Unauthorized. Please sign in again.', { variant: 'error' });
      navigate('/sign-in', { replace: true });
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [dispatch, navigate, enqueueSnackbar]);

  const signIn = async (email, password) => {
    const { data } = await adminLogin(email, password);
    const { access_token, refresh_token, user: loginUser } = data;

    tokenService.setTokens({ access_token, refresh_token });

    const tokenUser = tokenService.getUserFromToken();
    let profile = null;
    try {
      profile = await fetchMyProfile();
    } catch {
      // Profile optional — still use JWT + login.user
    }

    const user = buildSessionUser({ tokenUser, loginUser, profile });

    if (!ALLOWED_ROLES.includes(user?.role)) {
      tokenService.clearTokens();
      throw new Error('Access denied. Only administrators can access this dashboard.');
    }

    dispatch(setUser(user));
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
