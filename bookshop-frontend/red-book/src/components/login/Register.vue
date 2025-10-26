<template>
    <div class="register-container">
        <div class="register-header">
            <div class="close-btn" @click="closeDialog">&#10005;</div>
        </div>

        <div class="register-form">
            <div class="input-group">
                <label>用户名</label>
                <input type="text" v-model="formData.username" placeholder="请输入用户名" @blur="validateField('username')">
                <div class="error-message" v-if="errors.username">{{ errors.username }}</div>
            </div>

            <div class="input-group">
                <label>账号</label>
                <input type="text" v-model="formData.account" placeholder="请输入账号" @blur="validateField('account')">
                <div class="error-message" v-if="errors.account">{{ errors.account }}</div>
            </div>

            <div class="input-group">
                <label>邮箱</label>
                <input type="email" v-model="formData.email" placeholder="请输入邮箱" @blur="validateField('email')">
                <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
            </div>

            <div class="input-group">
                <label>密码</label>
                <input type="password" v-model="formData.password" placeholder="请输入密码（至少8位，包含字母和数字）"
                    @blur="validateField('password')">
                <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
            </div>

            <div class="input-group">
                <label>确认密码</label>
                <input type="password" v-model="formData.confirmPassword" placeholder="请再次输入密码"
                    @blur="validateField('confirmPassword')">
                <div class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
            </div>

            <div class="input-group">
                <label>性别</label>
                <div class="gender-options">
                    <label><input type="radio" v-model="formData.gender" value="男"> 男</label>
                    <label><input type="radio" v-model="formData.gender" value="女"> 女</label>
                </div>
                <div class="error-message" v-if="errors.gender">{{ errors.gender }}</div>
            </div>

            <div class="input-group">
                <label>个人简介</label>
                <textarea v-model="formData.introduction" placeholder="请输入个人简介"
                    @blur="validateField('introduction')"></textarea>
                <div class="error-message" v-if="errors.introduction">{{ errors.introduction }}</div>
            </div>

            <div class="input-group avatar-group">
                <label>头像</label>
                <div class="avatar-upload">
                    <div class="avatar-preview-wrapper" v-if="avatarPreview">
                        <div class="avatar-preview">
                            <img :src="avatarPreview" alt="Avatar Preview">
                            <div class="avatar-change" @click="triggerFileInput">更换</div>
                        </div>
                    </div>
                    <div class="avatar-upload-area" v-else @click="triggerFileInput">
                        <div class="upload-content">
                            <div class="plus-icon">+</div>
                            <div class="upload-text">上传头像</div>
                        </div>
                        <input type="file" ref="fileInput" @change="handleAvatarChange" accept="image/*"
                            class="file-input">
                    </div>
                </div>
                <div class="error-message" v-if="errors.avatar">{{ errors.avatar }}</div>
            </div>

            <button class="register-btn" @click="handleRegister">注册</button>

            <div class="login-link" @click="showLoginForm">已有账号？返回登录</div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { userInfoStore } from '../../store/user';
import {
    validateUsername,
    validateAccount,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    filterDirtyWords
} from '../../utils/formValidation';

const userStore = userInfoStore();
const props = defineProps(["showRegister"]);
const emits = defineEmits(["update:showRegister", "showLogin"]);

const formData = reactive({
    username: '',
    account: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    introduction: '',
    avatar: null
});

// 表单错误信息
const errors = reactive({
    username: '',
    account: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    introduction: '',
    avatar: ''
});

const avatarPreview = ref(null);
const fileInput = ref(null);

// 验证单个字段
const validateField = (field) => {
    switch (field) {
        case 'username':
            const usernameResult = validateUsername(formData.username);
            errors.username = usernameResult.valid ? '' : usernameResult.msg;
            break;
        case 'account':
            const accountResult = validateAccount(formData.account);
            errors.account = accountResult.valid ? '' : accountResult.msg;
            break;
        case 'email':
            errors.email = validateEmail(formData.email) ? '' : '邮箱格式不正确';
            break;
        case 'password':
            const passwordResult = validatePassword(formData.password);
            errors.password = passwordResult.valid ? '' : passwordResult.msg;
            // 如果修改了密码，需要重新验证确认密码
            if (formData.confirmPassword) {
                validateField('confirmPassword');
            }
            break;
        case 'confirmPassword':
            const confirmPasswordResult = validateConfirmPassword(formData.password, formData.confirmPassword);
            errors.confirmPassword = confirmPasswordResult.valid ? '' : confirmPasswordResult.msg;
            break;
        case 'introduction':
            // 检查简介是否包含脏话，如果有则进行过滤
            if (formData.introduction) {
                // 过滤脏话
                const filteredIntro = filterDirtyWords(formData.introduction);
                if (filteredIntro !== formData.introduction) {
                    formData.introduction = filteredIntro;
                    ElMessage.warning('个人简介中包含不适当的内容，已自动过滤');
                }
            }
            break;
    }
};

// 验证整个表单
const validateForm = () => {
    let isValid = true;

    // 验证所有字段
    validateField('username');
    validateField('account');
    validateField('email');
    validateField('password');
    validateField('confirmPassword');
    validateField('introduction');

    // 验证性别
    if (!formData.gender) {
        errors.gender = '请选择性别';
        isValid = false;
    } else {
        errors.gender = '';
    }

    // 验证头像
    if (!formData.avatar) {
        errors.avatar = '请上传头像';
        isValid = false;
    } else {
        errors.avatar = '';
    }

    // 检查是否有错误
    for (const key in errors) {
        if (errors[key]) {
            isValid = false;
            break;
        }
    }

    return isValid;
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        // 验证文件大小（5MB限制）
        if (file.size > 5 * 1024 * 1024) {
            ElMessage.error('头像图片大小不能超过5MB');
            return;
        }

        // 验证文件类型
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            ElMessage.error('只支持JPEG、PNG、GIF、WEBP格式的图片');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            avatarPreview.value = base64Image;
            formData.avatar = base64Image;
            errors.avatar = ''; // 清除头像错误
        };
        reader.readAsDataURL(file);
    }
};

const closeDialog = () => {
    emits("update:showRegister", false);
};

const showLoginForm = () => {
    closeDialog();
    emits("showLogin", true);
};

const handleRegister = async () => {
    // 验证表单
    if (!validateForm()) {
        // 查找第一个错误，并提示
        for (const key in errors) {
            if (errors[key]) {
                ElMessage.error(errors[key]);
                return;
            }
        }
        return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('account', formData.account);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('introduction', formData.introduction || '');
    formDataToSend.append('avatar', formData.avatar);

    try {
        const success = await userStore.register(formDataToSend);
        if (success) {
            showLoginForm();
        }
    } catch (error) {
        console.error('注册失败:', error);
        ElMessage.error('注册失败，请稍后再试');
    }
};
</script>

<style scoped>
.register-container {
    width: 500px;
    max-height: 90vh;
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(255, 46, 77, 0.2);
    position: relative;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    border: 1px solid #ffe6ea;
}

.register-container::-webkit-scrollbar {
    display: none;
}

.register-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 25px 20px 15px;
    position: relative;
    border-bottom: 1px solid #f5f5f5;
}

.close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #888;
    cursor: pointer;
    font-size: 20px;
    transition: all 0.3s ease;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.close-btn:hover {
    background-color: #ffe6ea;
    color: #ff2e4d;
}

.register-form {
    padding: 20px 40px 40px;
}

.input-group {
    margin-bottom: 20px;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
    font-size: 15px;
    text-align: left;
}

.input-group input,
.input-group textarea {
    width: 100%;
    padding: 12px 18px;
    border-radius: 12px;
    border: 2px solid #f0f0f0;
    background-color: #fafafa;
    font-size: 15px;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.input-group input:focus,
.input-group textarea:focus {
    border-color: #ff2e4d;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(255, 46, 77, 0.1);
    outline: none;
}

.input-group textarea {
    height: 100px;
    resize: none;
    border-radius: 15px;
}

.error-message {
    color: #ff2e4d;
    font-size: 13px;
    margin-top: 5px;
    text-align: left;
}

.gender-options {
    display: flex;
    gap: 25px;
    margin-top: 10px;
}

.gender-options label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: normal;
    color: #666;
    transition: all 0.2s ease;
}

.gender-options label:hover {
    color: #ff2e4d;
}

.gender-options input {
    margin-right: 8px;
    width: auto;
    accent-color: #ff2e4d;
}

.avatar-group {
    text-align: center;
}

.avatar-upload {
    display: flex;
    justify-content: center;
    margin: 15px auto;
}

.avatar-preview-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
}

.avatar-preview {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f5f5f5;
    border: 2px solid #ffe6ea;
    transition: all 0.3s ease;
    position: relative;
}

.avatar-preview:hover {
    transform: scale(1.03);
    border-color: #ff2e4d;
}

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-change {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 5px;
    text-align: center;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.3s ease;
}

.avatar-change:hover {
    background: rgba(0, 0, 0, 0.7);
}

.avatar-upload-area {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    border: 2px dashed #ff2e4d;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    background-color: rgba(255, 46, 77, 0.05);
    transition: all 0.3s ease;
}

.avatar-upload-area:hover {
    background-color: rgba(255, 46, 77, 0.1);
    transform: scale(1.03);
}

.upload-content {
    text-align: center;
}

.plus-icon {
    font-size: 28px;
    color: #ff2e4d;
    font-weight: bold;
    margin-bottom: 5px;
}

.upload-text {
    font-size: 13px;
    color: #ff2e4d;
    font-weight: 500;
}

.file-input {
    display: none;
}

.register-btn {
    width: 100%;
    background-color: #ff2e4d;
    color: white;
    border: none;
    padding: 14px 0;
    border-radius: 12px;
    margin-top: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(255, 46, 77, 0.3);
}

.register-btn:hover {
    background-color: #ff1a3d;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 46, 77, 0.4);
}

.register-btn:active {
    transform: translateY(0);
}

.login-link {
    text-align: center;
    margin-top: 20px;
    color: #ff2e4d;
    cursor: pointer;
    font-size: 14px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    display: inline-block;
    width: 100%;
    padding: 8px;
    border-radius: 6px;
}

.login-link:hover {
    background-color: rgba(255, 46, 77, 0.1);
    text-decoration: underline;
}
</style>