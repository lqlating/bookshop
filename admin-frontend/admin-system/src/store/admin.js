import { defineStore } from 'pinia'
import { ref } from 'vue'
import adminApi from '@/api/modules/adminApi'
import { ElMessage } from 'element-plus'

export const useAdminStore = defineStore('admin', () => {
    // 管理员是否登录
    const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true')

    // 加载状态
    const loading = ref(false)

    // 登录方法
    const login = async (account, password) => {
        try {
            loading.value = true
            const admin = { account, password }
            const res = await adminApi.login(admin)

            if (res.data && res.data.code === 1) {
                // 登录成功，设置登录状态
                isLoggedIn.value = true
                localStorage.setItem('isLoggedIn', 'true')
                ElMessage.success(res.data.msg || '登录成功')
                return true
            } else {
                // 登录失败
                ElMessage.error(res.data?.msg || '账号或密码错误')
                return false
            }
        } catch (error) {
            console.error('登录失败:', error)
            ElMessage.error('登录失败，请稍后重试')
            return false
        } finally {
            loading.value = false
        }
    }

    // 登出方法
    const logout = () => {
        isLoggedIn.value = false
        localStorage.removeItem('isLoggedIn')
    }

    return {
        isLoggedIn,
        loading,
        login,
        logout
    }
}) 