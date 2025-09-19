<template>
    <div class="edit-profile-container">
        <div class="edit-profile-header">
            <h2>编辑个人资料</h2>
            <div class="close-btn" @click="closeDialog">&#10005;</div>
        </div>

        <div class="edit-profile-form">
            <div class="input-group">
                <label>用户名</label>
                <input type="text" v-model="formData.username" placeholder="请输入用户名" @input="validateContent">
                <div class="error-message" v-if="errors.username">{{ errors.username }}</div>
            </div>

            <div class="input-group">
                <label>邮箱</label>
                <input type="email" v-model="formData.email" placeholder="请输入邮箱" @input="validateContent">
                <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
            </div>

            <div class="input-group">
                <label>性别</label>
                <div class="gender-options">
                    <label><input type="radio" v-model="formData.gender" value="男" @change="validateContent"> 男</label>
                    <label><input type="radio" v-model="formData.gender" value="女" @change="validateContent"> 女</label>
                </div>
                <div class="error-message" v-if="errors.gender">{{ errors.gender }}</div>
            </div>

            <div class="input-group">
                <label>个人简介</label>
                <textarea v-model="formData.introduction" placeholder="请输入个人简介" @input="validateContent"></textarea>
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
                    </div>
                    <input type="file" ref="fileInput" @change="handleAvatarChange" accept="image/*" class="file-input">
                </div>
                <div class="error-message" v-if="errors.avatar">{{ errors.avatar }}</div>
            </div>

            <button type="button" class="update-btn" @click="handleUpdate" :disabled="!isFormValid || hasDirtyWords"
                :class="{ 'disabled-btn': !isFormValid || hasDirtyWords }" :title="buttonTooltip">
                更新资料
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { userInfoStore } from '../../store/user';
import userApi from '../../api/userApi';
import {
    validateUsername,
    validateEmail,
    filterDirtyWords,
    containsDirtyWords
} from '../../utils/formValidation';

const props = defineProps({
    userData: Object,
});

const emits = defineEmits(["close", "update-success"]);
const userStore = userInfoStore();

// 表单数据
const formData = reactive({
    id: '',
    username: '',
    email: '',
    gender: '',
    introduction: '',
    avatar_base64: '',
});

// 表单错误信息
const errors = reactive({
    username: '',
    email: '',
    gender: '',
    introduction: '',
    avatar: ''
});

// 是否包含违禁词
const hasDirtyWords = ref(false);
// 按钮是否可用
const isFormValid = ref(true);

// 按钮提示文本
const buttonTooltip = computed(() => {
    if (hasDirtyWords.value) {
        return '内容包含违禁词，请修改后再提交';
    }
    if (!isFormValid.value) {
        return '请填写所有必填字段并确保格式正确';
    }
    return '提交修改';
});

const avatarPreview = ref(null);
const fileInput = ref(null);

// 初始化表单数据
onMounted(() => {
    // 确保有userData
    if (props.userData) {
        formData.id = props.userData.id;
        formData.username = props.userData.username;
        formData.email = props.userData.email;
        formData.gender = props.userData.gender;
        formData.introduction = props.userData.introduction || '';
        formData.avatar_base64 = props.userData.avatar_base64;

        // 设置头像预览
        if (props.userData.avatar_base64) {
            avatarPreview.value = `data:image/png;base64,${props.userData.avatar_base64}`;
        }

        // 初始验证一次表单
        validateContent();
    }
});

// 实时验证内容是否包含违禁词和其他验证
const validateContent = () => {
    // 检查违禁词
    const hasUsernameViolation = containsDirtyWords(formData.username);
    const hasIntroViolation = containsDirtyWords(formData.introduction);

    // 更新错误信息
    errors.username = hasUsernameViolation ? '用户名包含不适当内容' : '';
    errors.introduction = hasIntroViolation ? '个人简介包含不适当内容' : '';

    // 设置是否有违禁词
    hasDirtyWords.value = hasUsernameViolation || hasIntroViolation;

    // 检查其他字段
    const usernameValid = validateUsername(formData.username).valid;
    const emailValid = validateEmail(formData.email);
    const genderValid = !!formData.gender;

    // 更新表单是否有效
    isFormValid.value = usernameValid && emailValid && genderValid;
};

const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            ElMessage.error('头像图片大小不能超过5MB');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            ElMessage.error('只支持JPEG、PNG、GIF、WEBP格式的图片');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            avatarPreview.value = base64Image;
            formData.avatar_base64 = base64Image;
            errors.avatar = '';
        };
        reader.readAsDataURL(file);
    }
};

const closeDialog = () => {
    emits("close");
};

const handleUpdate = async () => {
    // 再次检查是否有违禁词
    if (hasDirtyWords.value) {
        ElMessage.error('内容包含违禁词，无法提交');
        return;
    }

    // 再次验证表单
    validateContent();
    if (!isFormValid.value) {
        ElMessage.error('请填写所有必填字段并确保格式正确');
        return;
    }

    try {
        const updateData = {
            id: formData.id,
            username: formData.username,
            email: formData.email,
            gender: formData.gender,
            introduction: formData.introduction
        };

        if (formData.avatar_base64) {
            if (formData.avatar_base64.startsWith('data:image')) {
                updateData.avatar_base64 = formData.avatar_base64.split(',')[1];
            } else {
                updateData.avatar_base64 = formData.avatar_base64;
            }
        }

        const response = await userApi.updateUserInfo(updateData);

        if (response.data && response.data.code === 1) {
            ElMessage.success('个人资料更新成功');
            userStore.setUserInfo({
                ...props.userData,
                ...updateData,
                avatar_base64: updateData.avatar_base64
            });
            emits("update-success");
        } else {
            throw new Error(response.data?.msg || '更新失败');
        }
    } catch (error) {
        console.error('更新个人资料失败:', error);
        ElMessage.error(error.message || '更新失败，请稍后再试');
    }
};
</script>

<style scoped>
.edit-profile-container {
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

.edit-profile-container::-webkit-scrollbar {
    display: none;
}

.edit-profile-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 25px 20px 15px;
    position: relative;
    border-bottom: 1px solid #f5f5f5;
}

.edit-profile-header h2 {
    margin: 0;
    color: #333;
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

.edit-profile-form {
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
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    overflow: hidden;
}

.update-btn {
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

.update-btn:hover {
    background-color: #ff1a3d;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 46, 77, 0.4);
}

.update-btn:active {
    transform: translateY(0);
}

.disabled-btn {
    background-color: #cccccc !important;
    color: #666666 !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
    transform: none !important;
}

.disabled-btn:hover {
    background-color: #cccccc !important;
    transform: none !important;
    box-shadow: none !important;
}
</style>