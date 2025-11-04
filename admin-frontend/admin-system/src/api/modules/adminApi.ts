import axiosInstance from "../axiosInstance";

interface AdminLoginData {
    account: string
    password: string
}

const adminApi = {
    // 管理员登录
    login(admin: AdminLoginData) {
        return axiosInstance.post('/admin/login', admin);
    }
};

export default adminApi;


