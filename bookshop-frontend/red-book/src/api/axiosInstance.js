// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // 这里是后端 API 的基础 URL
  timeout: 60000,
  // 不在实例级别设置Content-Type，让每个请求根据需要设置
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 设置默认的Content-Type为application/json（仅当不是FormData时）
    if (!(config.data instanceof FormData)) {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    } else {
      // 如果是FormData，完全删除Content-Type，让浏览器自动设置（包括boundary）
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
      if (config.headers.common) {
        delete config.headers.common['Content-Type'];
        delete config.headers.common['content-type'];
      }
      // 确保headers对象存在
      config.headers = config.headers || {};
      // 浏览器/axios会自动检测FormData并添加正确的Content-Type: multipart/form-data; boundary=...
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
