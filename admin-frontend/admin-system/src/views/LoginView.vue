<template>
  <div class="login-container">
    <div class="login-box">
      <h2>后台管理系统</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="account">
          <el-input v-model="loginForm.account" placeholder="请输入管理员账号" :prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password
            size="large" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="adminStore.loading" class="login-button"
            size="large">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useAdminStore } from '@/store/admin'

const router = useRouter()
const loginFormRef = ref()
const adminStore = useAdminStore()

const loginForm = reactive({
  account: '',
  password: ''
})

const rules = {
  account: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 表单验证
    await loginFormRef.value.validate()

    // 调用登录接口
    const success = await adminStore.login(loginForm.account, loginForm.password)

    if (success) {
      router.push('/books')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1f4068 0%, #304156 100%);
  position: fixed;
  top: 0;
  left: 0;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 15px;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 3px;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  letter-spacing: 2px;
  margin-top: 10px;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
}

:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__inner) {
  height: 45px;
  font-size: 15px;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-input__prefix-inner) {
  font-size: 18px;
  color: #909399;
}
</style>
