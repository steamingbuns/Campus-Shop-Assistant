import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('campusShopUser');
    const savedToken = localStorage.getItem('campusShopToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setIsLoggedIn(true);
    localStorage.setItem('campusShopUser', JSON.stringify(userData));
    localStorage.setItem('campusShopToken', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('campusShopUser');
    localStorage.removeItem('campusShopToken');
    localStorage.removeItem('campusShopCart'); // Clear cart on logout
  };

  const value = {
    isLoggedIn,
    user,
    token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};