const API_CONFIG = {
  development: {
    baseUrl: '',  // Empty string to use Vite's proxy
  },
  production: {
    baseUrl: 'https://api.dashboard.esit.app',
  }
};

export const getApiConfig = () => {
  const env = import.meta.env.MODE || 'development';
  return API_CONFIG[env as keyof typeof API_CONFIG];
};

export const API_URL = getApiConfig().baseUrl;
