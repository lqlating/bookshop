<template>
    <div class="comment-detail">
        <!-- 评论内容区域 -->
        <div class="comment-content-container">
            <div class="comment-content-block">
                <p class="comment-content">{{ comment.content }}</p>
                <p class="comment-info">
                    目标类型: <span class="target-type">{{ targetTypeText }}</span>
                    | 目标ID: <span class="target-id">{{ targetId }}</span>
                </p>
                <p class="comment-date">{{ comment.publish_time }}</p>
            </div>
        </div>

        <!-- 中间分割线 -->
        <div class="vertical-divider"></div>

        <!-- 用户信息 -->
        <div class="user-info-container">
            <div v-if="isLoading" class="user-loading">加载用户信息中...</div>
            <div v-else-if="userInfo" class="user-info">
                <div v-if="!userInfo.avatar_base64" class="avatar-skeleton"></div>
                <div v-else class="avatar-container">
                    <img :src="`data:image/jpeg;base64,${userInfo.avatar_base64}`" alt="用户头像" class="user-avatar" />
                </div>
                <p class="user-name">{{ userInfo.username }}</p>
            </div>
            <div v-else class="user-error">获取用户信息失败</div>
        </div>

        <!-- 关闭按钮 -->
        <button class="close-btn" @click="$emit('close')">✖</button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import userApi from '@/api/modules/userApi'

const props = defineProps({
    comment: Object
})

console.log('Comment data:', props.comment)

const emit = defineEmits(['close'])

const userInfo = ref(null)
const isLoading = ref(true)

// 计算目标类型
const targetTypeText = computed(() => {
    if (props.comment.target_type) {
        return props.comment.target_type === 'article' ? '文章' : '书籍'
    }
    return props.comment.article_id ? '文章' : '评论'
})

// 计算目标ID
const targetId = computed(() => {
    if (props.comment.target_id) {
        return props.comment.target_id
    }
    return props.comment.article_id || props.comment.parent_id || '未知'
})

onMounted(async () => {
    if (!props.comment || typeof props.comment.user_id === 'undefined' || props.comment.user_id === null) {
        console.error('评论数据中缺少用户ID:', props.comment)
        isLoading.value = false
        return
    }

    try {
        console.log('正在获取用户信息，用户ID:', props.comment.user_id)
        const response = await userApi.SearchUserById(props.comment.user_id)
        console.log('User API Response:', response)
        if (response.data?.data?.[0]) {
            userInfo.value = response.data.data[0]
        } else {
            console.warn('用户API返回了空数据')
            userInfo.value = {
                username: `未知用户 (ID: ${props.comment.user_id})`,
                avatar_base64: null
            }
        }
    } catch (error) {
        console.error('Failed to fetch user info:', error)
        userInfo.value = {
            username: `未知用户 (ID: ${props.comment.user_id})`,
            avatar_base64: null
        }
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
.comment-detail {
    position: relative;
    display: flex;
    width: 700px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 24px;
    gap: 24px;
}

.comment-content-container {
    flex: 1;
}

.comment-content-block {
    flex: 1;
}

.comment-content {
    font-size: 16px;
    line-height: 1.8;
    color: #333;
    margin-bottom: 20px;
}

.comment-info {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
}

.target-type,
.target-id {
    font-weight: 500;
    color: #409eff;
}

.comment-date {
    font-size: 14px;
    color: #999;
}

.vertical-divider {
    width: 1px;
    background-color: #e0e0e0;
    margin: 0 16px;
}

.user-info-container {
    width: 200px;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

.user-loading {
    text-align: center;
    color: #666;
    padding: 16px;
}

.user-error {
    color: #f56c6c;
    text-align: center;
    padding: 16px;
}

.avatar-container {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 12px;
}

.avatar-skeleton {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #eee;
    margin-bottom: 12px;
}

.user-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin: 0;
    text-align: center;
}

.close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #f5f5f5;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #e0e0e0;
    color: #333;
}
</style>