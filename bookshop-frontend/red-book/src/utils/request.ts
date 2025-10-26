import axios from 'axios';

// 创建 Axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:8080', // 设置请求的基础 URL
  timeout: 5000 // 设置请求超时时间为 5 秒
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    config.headers.Authorization = localStorage.getItem('token'); // 在请求头中添加授权信息
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 对响应数据做些什么
    return response.data; // 返回响应数据
  },
  error => {
    // 对响应错误做些什么
    return Promise.reject(error); // 返回 Promise.reject，以便后续处理
  }
);
export default instance

// 封装请求方法
export function get(url, params) {
  return instance.get(url, { params }); // 发起 GET 请求
}

export function post(url, data) {
  return instance.post(url, data); // 发起 POST 请求
}

// 更多功能和接口可以继续封装...
