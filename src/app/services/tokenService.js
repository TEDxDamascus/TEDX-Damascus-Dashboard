const ACCESS_TOKEN_KEY = 'tedx_access_token';
const REFRESH_TOKEN_KEY = 'tedx_refresh_token';

function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const tokenService = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens({ access_token, refresh_token }) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  decodeAccessToken() {
    const token = this.getAccessToken();
    return token ? decodeJwt(token) : null;
  },

  isAccessTokenExpired() {
    const payload = this.decodeAccessToken();
    if (!payload?.exp) return true;
    return Date.now() >= (payload.exp - 10) * 1000;
  },

  getUserFromToken() {
    const payload = this.decodeAccessToken();
    if (!payload) return null;
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions ?? [],
      is_active: true,
    };
  },
};
