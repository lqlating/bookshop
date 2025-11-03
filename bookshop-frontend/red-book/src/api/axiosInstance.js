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
    // 如果数据是FormData，让浏览器自动设置Content-Type（包括boundary）
    if (config.data instanceof FormData) {
      // 如果已经明确设置了multipart/form-data，保留它
      // 否则删除默认的Content-Type，让浏览器自动设置（包括boundary）
      if (!config.headers['Content-Type'] ||
        config.headers['Content-Type'] === 'application/json') {
        delete config.headers['Content-Type'];
      }
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
