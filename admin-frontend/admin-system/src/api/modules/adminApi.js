import axiosInstance from "../axiosInstance";

const adminApi = {
    // 管理员登录
    login(admin) {
        return axiosInstance.post('/admin/login', admin);
    }
};

export default adminApi; 