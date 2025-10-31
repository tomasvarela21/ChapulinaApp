import api from './api';

const productService = {
  // Get all products
  getAll: async (filters = {}) => {
    const { category, search, sortBy } = filters;
    const params = new URLSearchParams();

    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Get one product
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get low stock products
  getLowStock: async (threshold = 5) => {
    const response = await api.get(`/products/low-stock?threshold=${threshold}`);
    return response.data;
  },

  // Update all list prices based on markup
  updateAllListPrices: async (priceMarkup) => {
    const response = await api.put('/products/update-list-prices', { priceMarkup });
    return response.data;
  }
};

export default productService;
