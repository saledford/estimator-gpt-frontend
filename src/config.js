// API Configuration
export const API_BASE = 'https://estimator-gpt-backend.onrender.com';

// You can add other configuration values here as needed
export const APP_CONFIG = {
  API_TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FILE_TYPES: ['.pdf'],
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds
};

export default {
  API_BASE,
  ...APP_CONFIG,
};
