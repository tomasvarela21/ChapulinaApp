import api from './api';

const userService = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Obtener un usuario por ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Crear nuevo usuario
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Obtener estadísticas de ventas de un usuario
  getSalesStats: async (id) => {
    const response = await api.get(`/users/${id}/sales-stats`);
    return response.data;
  },

  // Obtener estadísticas de ventas de todos los vendedores
  getAllSalesStats: async () => {
    const response = await api.get('/users/sales-stats/all');
    return response.data;
  }
};

export default userService;
