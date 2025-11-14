import api from './api';

const saleService = {
  // Get all sales
  getAll: async (filters = {}) => {
    const { status, startDate, endDate } = filters;
    const params = new URLSearchParams();

    if (status && status !== 'all') params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/sales?${params.toString()}`);
    return response.data;
  },

  // Get one sale
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Create sale
  create: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // Update sale
  update: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },

  // Delete sale
  delete: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },

  // Get sales stats
  getStats: async (filters = {}) => {
    const { startDate, endDate } = filters;
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/sales/stats?${params.toString()}`);
    return response.data;
  }
};

export default saleService;
