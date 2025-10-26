<script setup>
// test
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userInfoStore } from '../../store/user'

// 获取pinia中的userStore
const userStore = userInfoStore()
const router = useRouter()

const props = defineProps(['showLogin'])
const emits = defineEmits(['update:showLogin', 'showRegister'])

const formData = reactive({
  account: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const closeDialog = () => {
  errorMessage.value = ''
  emits('update:showLogin', false)
}

const showRegisterForm = () => {
  closeDialog()
  emits('showRegister', true)
}

const handleLogin = async () => {
  errorMessage.value = ''

  if (!formData.account || !formData.password) {
    errorMessage.value = '请输入账号和密码'
    return
  }

  loading.value = true
  try {
    // 将账号和密码设置到store中
    userStore.account = formData.account;
    userStore.password = formData.password;

    // 使用store的submitLogin方法
    await userStore.submitLogin();

    // 登录成功后，submitLogin方法会自动处理状态更新和页面跳转
    // 关闭登录对话框
    closeDialog();
  } catch (error) {
    console.error('登录失败:', error)
    // 显示具体的错误消息
    errorMessage.value = error.message || '登录失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <div class="main-body">
    <div class="input-container">
      <input type="text" placeholder="account" class="input-thing account" v-model="formData.account">
    </div>
    <div class="input-container">
      <input type="password" placeholder="password" class="input-thing" v-model="formData.password">
    </div>

    <!-- 添加错误信息显示区域 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <button class="login-btn" @click="handleLogin" :disabled="loading">
      {{ loading ? '登录中...' : 'Login' }}
    </button>
    <div class="register-link" @click="showRegisterForm">注册账号</div>
    <div class="close-btn" @click="closeDialog">&#10005;</div>
  </div>
</template>



<style scoped>
.main-body {
  width: 400px;
  height: 300px;
  /* 增加高度，为错误信息留出空间 */
  background-color: #fff;
  border-radius: 20px;
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.input-container {
  margin-bottom: 10px;
}

.input-thing {
  font-size: 16px;
  padding-left: 15px;
  width: 220px;
  height: 46px;
  border-radius: 46px;
  outline: none;
  border: none;
  background-color: #f0f0f0;
}

.error-message {
  color: #ff2e4d;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
  max-width: 250px;
  background-color: rgba(255, 46, 77, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
}

.login-btn {
  outline: none;
  background-color: #ff2e4d;
  font-size: 16px;
  font-weight: bold;
  height: 46px;
  width: 237px;
  /* Set width same as input */
  border-radius: 46px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #fff;
  border: none;
}

.login-btn:disabled {
  background-color: #ff99a8;
  cursor: not-allowed;
}

.register-link {
  margin-top: 10px;
  color: #ff2e4d;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  color: #333;
  cursor: pointer;
}

img {
  margin-left: 0px;
  margin-bottom: 10px;
  width: 110px;
}
</style>
