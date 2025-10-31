/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          // Verificar que el token aún sea válido
          const response = await authService.getMe();
          if (response.success) {
            setUser(response.data);
          } else {
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      if (response.success) {
        setUser(response.data);
        return { success: true };
      }
      return { success: false, message: 'Error al iniciar sesión' };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setError(null);
      const response = await authService.register(name, email, password, role);
      if (response.success) {
        setUser(response.data);
        return { success: true };
      }
      return { success: false, message: 'Error al registrar usuario' };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar usuario';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await authService.updatePassword(currentPassword, newPassword);
      if (response.success) {
        return { success: true, message: 'Contraseña actualizada correctamente' };
      }
      return { success: false, message: 'Error al actualizar contraseña' };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar contraseña';
      setError(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updatePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
