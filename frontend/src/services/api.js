import axios from 'axios';

// Base API URL - uses environment variable in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug: Log the API URL being used
console.log('🔗 API URL configured:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Authentication =====
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// ===== Mobiles =====
export const mobileAPI = {
  getAll: (params) => api.get('/mobiles', { params }),
  getById: (id) => api.get(`/mobiles/${id}`),
  getByIMEI: (imei) => api.get(`/mobiles/imei/${imei}`),
  create: (data) => api.post('/mobiles', data),
  update: (id, data) => api.put(`/mobiles/${id}`, data),
  delete: (id) => api.delete(`/mobiles/${id}`),
  getBrands: () => api.get('/mobiles/brands/list')
};

// ===== Accessories =====
export const accessoryAPI = {
  getAll: (params) => api.get('/accessories', { params }),
  getById: (id) => api.get(`/accessories/${id}`),
  create: (data) => api.post('/accessories', data),
  update: (id, data) => api.put(`/accessories/${id}`, data),
  delete: (id) => api.delete(`/accessories/${id}`),
  getLowStock: () => api.get('/accessories/alerts/low-stock'),
  getCategories: () => api.get('/accessories/categories/list')
};

// ===== Customers =====
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

// ===== Sales =====
export const saleAPI = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  delete: (id) => api.delete(`/sales/${id}`)
};

// ===== Reports =====
export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getProfitReport: (params) => api.get('/reports/profit', { params }),
  getInventoryReport: () => api.get('/reports/inventory')
};

export default api;
