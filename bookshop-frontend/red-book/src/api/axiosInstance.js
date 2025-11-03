// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // 这里是后端 API 的基础 URL
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 如果数据是FormData，确保正确设置Content-Type
    if (config.data instanceof FormData) {
      // 删除所有可能设置的Content-Type
      // 让axios自动检测FormData并设置正确的multipart/form-data（包括boundary参数）
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
      if (config.headers.common) {
        delete config.headers.common['Content-Type'];
        delete config.headers.common['content-type'];
      }
      // axios会自动检测FormData并添加正确的Content-Type: multipart/form-data; boundary=...
    }
    // 可以在这里添加 token
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
