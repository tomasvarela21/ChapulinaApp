import api from './api';

const settingsService = {
  // Get settings
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update settings
  update: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  }
};

export default settingsService;
