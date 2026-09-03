import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  getStores: (params) => api.get('/admin/stores', { params }),
  createStore: (data) => api.post('/admin/stores', data),
};

// Stores (Normal User)
export const storeAPI = {
  getStores: (params) => api.get('/stores', { params }),
  submitRating: (storeId, data) => api.post(`/stores/${storeId}/rating`, data),
  modifyRating: (storeId, data) => api.put(`/stores/${storeId}/rating`, data),
};

// Owner
export const ownerAPI = {
  getDashboard: () => api.get('/owner/dashboard'),
};

export default api;
