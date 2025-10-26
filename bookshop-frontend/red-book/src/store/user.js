// src/stores/userStore.js
import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import userApi from "../api/userApi";

// 检查存储的数据是否过期
const isDataExpired = (timestamp) => {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
    return now - timestamp > oneDay;
};

// 从 sessionStorage 获取数据
const getStoredUserData = () => {
    const storedData = sessionStorage.getItem('userInfo');
    if (storedData) {
        const { data, timestamp } = JSON.parse(storedData);
        if (!isDataExpired(timestamp)) {
            return data;
        }
        sessionStorage.removeItem('userInfo'); // 删除过期数据
    }
    return null;
};

export const userInfoStore = defineStore('user', () => {
    // 用户输入的账号和密码 - 只在内存中保存，不持久化存储
    const account = ref('');
    const password = ref('');

    // 用户是否已登录以及是否显示登录框
    const isLogin = ref(!!getStoredUserData());
    const showLogin = ref(false);

    // 用户目标 ID 列表
    const targetIds = ref([]);

    // 用户信息对象，包含各种用户属性
    const userThing = reactive({
        username: '',
        email: '',
        id: '',
        avatar_base64: '',
        account: '',
        subscript: 0,
        introduction: '',
        gender: '',
        fans: 0,
        is_banned: 0,
        ban_until: null
    });

    // 从 sessionStorage 恢复用户信息
    const storedUserInfo = getStoredUserData();
    if (storedUserInfo) {
        Object.assign(userThing, storedUserInfo);
    }

    // 设置用户信息
    const setUserInfo = (userData) => {
        // 移除敏感信息，确保不将密码等信息存储到持久化存储中
        const { password: _, ...safeUserData } = userData;

        Object.assign(userThing, safeUserData);

        // 保存用户信息到 sessionStorage，但排除敏感字段
        const dataToStore = { ...safeUserData };
        // 确保不存储password相关信息
        delete dataToStore.password;

        sessionStorage.setItem('userInfo', JSON.stringify({
            data: dataToStore,
            timestamp: new Date().getTime()
        }));

        isLogin.value = true;
    };

    // 提交登录信息
    const submitLogin = async () => {
        try {
            const response = await userApi.login(account.value, password.value);
            const { data } = response;

            if (data && data.code === 0) {
                throw new Error("密码或者账号错误，请重新输入");
            } else {
                // 检查用户是否被封禁
                if (data.data.is_banned === 1) {
                    // 格式化ban_until时间
                    const banUntilDate = new Date(data.data.ban_until);
                    const formattedDate = banUntilDate.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    throw new Error(`您的账号已被封禁至${formattedDate}，有问题请联系管理员`);
                }

                const userData = {
                    username: data.data.username,
                    email: data.data.email,
                    id: data.data.id,
                    avatar_base64: data.data.avatar_base64,
                    gender: data.data.gender,
                    introduction: data.data.introduction,
                    fans: data.data.fans,
                    subscript: data.data.subscript,
                    is_banned: data.data.is_banned,
                    ban_until: data.data.ban_until
                };

                setUserInfo(userData);
                // 登录成功后清空登录凭据
                account.value = '';
                password.value = '';
                ElMessage.success("登录成功");

                // 添加一个短暂的延时，确保数据保存后再刷新页面
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error) {
            console.error('Error:', error);
            account.value = '';
            password.value = '';
            throw error; // 将错误传递给组件
        }
    };

    // 退出登录
    const logout = () => {
        // 重置所有状态
        isLogin.value = false;
        showLogin.value = false;
        account.value = '';
        password.value = '';
        targetIds.value = [];
        Object.assign(userThing, {
            username: '',
            email: '',
            id: '',
            avatar_base64: '',
            account: '',
            subscript: 0,
            introduction: '',
            gender: '',
            fans: 0,
            is_banned: 0,
            ban_until: null
        });
        sessionStorage.removeItem('userInfo');
        ElMessage.success("登出成功");
    };

    // 获取目标 ID 列表
    const fetchTargetIds = async (userId) => {
        try {
            const response = await userApi.getSubscriptions(userId);
            if (response.data.code === 1) {
                targetIds.value = response.data.data;
            }
        } catch (error) {
            console.error('获取订阅列表失败:', error);
        }
    };

    // 订阅（关注）作者
    const insertSubscript = async (authorId) => {
        try {
            // 防止用户关注自己
            if (authorId === userThing.id) {
                ElMessage.warning("不能关注自己！");
                return false;
            }

            const response = await userApi.subscribeUser(userThing.id, authorId);
            if (response?.data?.code === 1) {
                await fetchTargetIds(userThing.id);
                ElMessage.success("关注成功");
                return true;
            } else {
                ElMessage.error(response.data.data || "关注失败");
                return false;
            }
        } catch (error) {
            console.error('关注失败:', error);
            ElMessage.error(error.response?.data?.data || "关注失败");
            return false;
        }
    };

    // 取消订阅（取消关注）作者
    const deleteSubscript = async (authorId) => {
        try {
            const response = await userApi.unsubscribeUser(userThing.id, authorId);
            if (response?.data?.code === 1) {
                await fetchTargetIds(userThing.id);
                ElMessage.success("取消关注成功");
                return true;
            } else {
                ElMessage.error(response.data.data || "取消关注失败");
                return false;
            }
        } catch (error) {
            console.error('取消关注失败:', error);
            ElMessage.error(error.response?.data?.data || "取消关注失败");
            return false;
        }
    };

    // 根据ID查找用户
    const searchUserById = async (userId) => {
        try {
            const response = await userApi.SearchUserById(userId);
            return response.data;
        } catch (error) {
            console.error('查找用户失败:', error);
            return null;
        }
    };

    // 根据用户名查找用户
    const searchUserByUsername = async (username) => {
        try {
            const response = await userApi.SearchUserByUsername(username);
            return response.data;
        } catch (error) {
            console.error('查找用户失败:', error);
            return null;
        }
    };

    // 更新用户信息
    const updateUserInfo = async (userUpdateData) => {
        try {
            // 确保不传递敏感信息到后端
            const { password: _, ...safeUpdateData } = userUpdateData;

            const response = await userApi.updateUserInfo(safeUpdateData);
            if (response.data.code === 1) {
                setUserInfo({ ...userThing, ...response.data.data });
                ElMessage.success("信息更新成功");
                return true;
            } else {
                ElMessage.error(response.data.msg || "更新失败");
                return false;
            }
        } catch (error) {
            console.error('更新用户信息失败:', error);
            ElMessage.error("更新失败，请稍后再试");
            return false;
        }
    };

    // 注册新用户
    const register = async (formData) => {
        try {
            const response = await userApi.register(formData);
            if (response.data && response.data.code === 1) {
                ElMessage.success("注册成功");
                return true;
            } else {
                ElMessage.error(response.data?.msg || "注册失败");
                return false;
            }
        } catch (error) {
            console.error('注册失败:', error);
            ElMessage.error(error.response?.data?.msg || "注册失败，请稍后再试");
            return false;
        }
    };

    // 仅当 userThing.id 有值时才调用
    if (userThing.id) {
        fetchTargetIds(userThing.id);
    }

    return {
        account,
        password,
        isLogin,
        showLogin,
        targetIds,
        userThing,
        submitLogin,
        logout,
        insertSubscript,
        deleteSubscript,
        searchUserById,
        searchUserByUsername,
        updateUserInfo,
        register,
        setUserInfo
    };
});
