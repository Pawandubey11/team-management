import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Company
export const companyAPI = {
  getCompany: (id) => API.get(`/company/${id}`),
  updateCompany: (id, data) => API.put(`/company/${id}`, data),
  createCompany: (data) => API.post('/company', data),
};

// Departments
export const departmentAPI = {
  getDepartments: () => API.get('/departments'),
  getDepartment: (id) => API.get(`/departments/${id}`),
  createDepartment: (data) => API.post('/departments', data),
  updateDepartment: (id, data) => API.put(`/departments/${id}`, data),
};

// Users
export const userAPI = {
  getUsers: () => API.get('/users'),
  getUser: (id) => API.get(`/users/${id}`),
  createUser: (data) => API.post('/users', data),
  assignDepartment: (id, data) => API.put(`/users/${id}/department`, data),
  toggleStatus: (id) => API.put(`/users/${id}/status`),
};

// Groups
export const groupAPI = {
  getGroups: () => API.get('/groups'),
  getGroup: (id) => API.get(`/groups/${id}`),
  createGroup: (data) => API.post('/groups', data),
};

// Messages
export const messageAPI = {
  getGroupMessages: (groupId, page = 1) => API.get(`/messages/group/${groupId}?page=${page}&limit=50`),
  sendMessage: (data) => API.post('/messages', data),
  deleteMessage: (id) => API.delete(`/messages/${id}`),
};

export default API;
