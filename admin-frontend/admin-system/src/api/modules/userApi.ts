import axiosInstance from '../axiosInstance';
import { ElMessage } from "element-plus";

interface User {
    id?: number;
    username: string;
    password: string;
    email: string;
    account: string;
    avatar: string | null;
    gender?: string;
    introduction?: string;
    is_banned?: number;
    fans?: string;
    subscript?: string;
    [key: string]: any; // 允许额外的字符串索引
}

const userApi = {
    // 根据用户ID搜索用户
    SearchUserById(authorId: number) {
        return axiosInstance.get(`/SearchUserById/${authorId}`);
    },

    // 根据用户名搜索用户
    SearchUserByUsername(username: string) {
        return axiosInstance.get(`/SearchUserByUsername?username=${username}`);
    },

    // 删除用户
    DeleteUser(id: number) {
        return axiosInstance.delete(`/DeleteUser/${id}`);
    },

    // 添加新用户
    NewUser(user: User) {
        return axiosInstance.post('/NewUser', user, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    // 更新用户信息
    editUser(user: User) {
        return axiosInstance.put('/editUser', user);
    },

    // 用户登录验证
    login(account: string, password: string) {
        return axiosInstance.post('/login', {
            account,
            password
        });
    },

    // 获取所有被禁用的用户
    getBannedUsers() {
        return axiosInstance.get('/getBannedUsers');
    },

    // 禁用用户
    banUser(userId: number, banDays: number = 7) {
        return axiosInstance.post('/banUser', null, {
            params: {
                userId,
                banDays
            }
        });
    },

    // 解封用户
    unbanUser(userId: number) {
        return axiosInstance.post('/unbanUser', null, {
            params: {
                userId
            }
        });
    },

    // 更新用户信息（含头像）
    updateUserInfo(userUpdateData: User) {
        return axiosInstance.put('/updateUserInfo', userUpdateData);
    },

    // 用户注册
    register(formData: FormData) {
        return new Promise((resolve, reject) => {
            // 转换FormData为JSON对象
            const userData: Partial<User> = {};
            let avatarFile: File | null = null;

            // 首先提取所有非头像字段
            formData.forEach((value, key) => {
                if (key === 'avatar' && value instanceof File) {
                    avatarFile = value;
                } else if (typeof value === 'string') {
                    userData[key as keyof User] = value;
                }
            });

            // 确保account字段存在
            if (!userData.account) {
                ElMessage.error('账号不能为空');
                reject(new Error('账号不能为空'));
                return;
            }

            // 检查必要的字段
            const requiredFields = ['username', 'password', 'email', 'account'] as const;
            for (const field of requiredFields) {
                if (!userData[field]) {
                    ElMessage.error(`${field}字段不能为空`);
                    reject(new Error(`${field}字段不能为空`));
                    return;
                }
            }

            // 如果有头像文件，转换为base64
            if (avatarFile) {
                const reader = new FileReader();
                reader.onload = function () {
                    if (typeof reader.result === 'string') {
                        const base64 = reader.result.split(',')[1]; // 移除data:image/xxx;base64,前缀

                        // 创建请求对象，确保包含所有必要字段
                        const requestData: User = {
                            username: userData.username!,
                            password: userData.password!,
                            email: userData.email!,
                            account: userData.account!,
                            avatar: base64,
                            gender: userData.gender || '未设置',
                            introduction: userData.introduction || '',
                            is_banned: 0,
                            fans: "0",
                            subscript: ""
                        };

                        console.log('注册请求数据:', requestData);

                        // 发送请求
                        axiosInstance.post('/NewUser', requestData, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(resolve).catch(reject);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(avatarFile);
            } else {
                // 创建请求对象，确保包含所有必要字段
                const requestData: User = {
                    username: userData.username!,
                    password: userData.password!,
                    email: userData.email!,
                    account: userData.account!,
                    avatar: null,
                    gender: userData.gender || '未设置',
                    introduction: userData.introduction || '',
                    is_banned: 0,
                    fans: "0",
                    subscript: ""
                };

                console.log('注册请求数据:', requestData);

                // 发送请求
                axiosInstance.post('/NewUser', requestData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(resolve).catch(reject);
            }
        });
    },

    // 获取用户订阅列表
    getSubscriptions(userId: number) {
        return axiosInstance.get(`/getSubscriptions/${userId}`);
    },

    // 订阅用户
    subscribeUser(userId: number, targetId: number) {
        return axiosInstance.post('/subscribeUser', null, {
            params: {
                userId,
                targetId
            }
        });
    },

    // 取消订阅用户
    unsubscribeUser(userId: number, targetId: number) {
        return axiosInstance.post('/unsubscribeUser', null, {
            params: {
                userId,
                targetId
            }
        });
    }
};

export default userApi; 