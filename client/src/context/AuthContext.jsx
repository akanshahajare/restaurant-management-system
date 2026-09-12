import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('adminAuth');

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem('adminAuth');
      }
    }

    return null;
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('userAuth');

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem('userAuth');
      }
    }

    return null;
  });

  /*
   * Attach the correct token when the authentication state changes.
   *
   * Admin and customer sessions use separate localStorage entries,
   * but the API uses the same Authorization header.
   */
  useEffect(() => {
    if (admin?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${admin.token}`;
    } else if (user?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${user.token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [admin, user]);

  /*
   * Persist admin authentication.
   */
  useEffect(() => {
    if (admin?.token) {
      localStorage.setItem('adminAuth', JSON.stringify(admin));
    } else {
      localStorage.removeItem('adminAuth');
    }
  }, [admin]);

  /*
   * Persist customer authentication.
   */
  useEffect(() => {
    if (user?.token) {
      localStorage.setItem('userAuth', JSON.stringify(user));
    } else {
      localStorage.removeItem('userAuth');
    }
  }, [user]);

  /*
   * Admin login.
   */
  const login = (adminData) => {
    if (adminData?.token) {
      api.defaults.headers.common.Authorization =
        `Bearer ${adminData.token}`;
    }

    localStorage.setItem('adminAuth', JSON.stringify(adminData));
    setAdmin(adminData);

    toast.success('Admin logged in');
  };

  /*
   * Customer login.
   */
  const loginCustomer = (userData) => {
    if (userData?.token) {
      api.defaults.headers.common.Authorization =
        `Bearer ${userData.token}`;
    }

    localStorage.setItem('userAuth', JSON.stringify(userData));
    setUser(userData);

    toast.success('Welcome back!');
  };

  /*
   * Customer registration.
   *
   * The backend returns a token immediately after registration,
   * so the customer is logged in without needing another login.
   */
  const registerCustomer = (userData) => {
    if (userData?.token) {
      api.defaults.headers.common.Authorization =
        `Bearer ${userData.token}`;
    }

    localStorage.setItem('userAuth', JSON.stringify(userData));
    setUser(userData);

    toast.success('Account created successfully');
  };

  /*
   * Admin logout.
   */
  const logout = () => {
    localStorage.removeItem('adminAuth');

    setAdmin(null);

    /*
     * Only remove the Authorization header if there isn't
     * an active customer session.
     */
    if (!user?.token) {
      delete api.defaults.headers.common.Authorization;
    }

    toast('Logged out');
  };

  /*
   * Customer logout.
   */
  const logoutCustomer = () => {
    localStorage.removeItem('userAuth');

    setUser(null);

    /*
     * Keep the admin token if an admin session exists.
     */
    if (!admin?.token) {
      delete api.defaults.headers.common.Authorization;
    }

    toast('Logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        user,

        login,
        logout,

        loginCustomer,
        registerCustomer,
        logoutCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);