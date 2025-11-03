// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // 这里是后端 API 的基础 URL
  timeout: 60000,
  // 不在实例级别设置Content-Type，让每个请求根据需要设置
  // headers: {
  //   'Content-Type': 'application/json',
  // },
  // 关键：不覆盖默认的transformRequest，但要确保FormData不被转换
  transformRequest: [
    function (data, headers) {
      // 如果是FormData，直接返回，不进行任何转换
      if (data instanceof FormData) {
        // 删除Content-Type，让浏览器自动设置multipart/form-data（包括boundary）
        delete headers['Content-Type'];
        delete headers['content-type'];
        return data; // 直接返回FormData对象
      }
      // 如果不是FormData，使用axios默认的转换（JSON序列化等）
      // axios默认会将对象转换为JSON字符串
      if (typeof data === 'object' && data !== null && !(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        return JSON.stringify(data);
      }
      return data;
    }
  ]
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 如果数据是FormData，完全删除Content-Type，让浏览器/XHR自动设置（包括boundary）
    if (config.data instanceof FormData) {
      // 完全移除所有Content-Type相关的设置
      // 这是关键：XMLHttpRequest检测到FormData且没有Content-Type时，会自动设置正确的multipart/form-data; boundary=...

      // 删除所有可能位置的Content-Type
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
        // 删除common中的Content-Type
        if (config.headers.common) {
          delete config.headers.common['Content-Type'];
          delete config.headers.common['content-type'];
        }
        // 删除post中的Content-Type（如果有）
        if (config.headers.post) {
          delete config.headers.post['Content-Type'];
          delete config.headers.post['content-type'];
        }
      }

      // 确保headers对象存在
      config.headers = config.headers || {};

      // 重要：完全不设置Content-Type，让XMLHttpRequest自动检测FormData
      // XMLHttpRequest会自动设置：Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

      // 添加调试日志
      console.log('发送FormData，Content-Type已删除，让浏览器自动设置', {
        isFormData: config.data instanceof FormData,
        headers: config.headers
      });
    } else {
      // 如果不是FormData，设置默认的Content-Type为application/json
      config.headers = config.headers || {};
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
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
