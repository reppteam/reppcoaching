// Set the access token in localStorage
export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('accessToken');
  }
};

// Get the access token from localStorage
export const getSession = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Clear all authentication data
export const clearSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('outlook_access_token');
  localStorage.removeItem('outlook_refresh_token');
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_refresh_token');
  localStorage.removeItem('ring_central_token');
  localStorage.removeItem('ring_central_refresh_token');
  localStorage.removeItem('ring_central_user_data');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getSession();
  return !!token;
};

// Get user from localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user in localStorage
export const setUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
}; 