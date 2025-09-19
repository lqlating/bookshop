<template>
    <div class="article-inner" v-if="localArticleInner">
        <span class="article_img_inner" @click="openOverlay">
            <img :src="img_url ? `data:image/png;base64,${img_url}` : '/images/default_image.jpg'" alt="Article Image"
                :class="{ 'fit-height': isTallImage, 'fit-width': !isTallImage }" />
        </span>
        <span>
            <div class="article-content">
                <div class="inner-title">{{ articleTitle }}</div>
                <div class="inner-content">{{ content }}</div>
                <div class="date">
                    {{ publication_time }} {{ address }}
                </div>
                <div class="end"> -THE END-</div>
            </div>

            <!-- 作者信息 -->
            <div v-if="isLoading" class="author-loading">加载作者信息中...</div>
            <div v-else-if="userName" class="user-inner">
                <div class="avatar-container">
                    <img v-if="avatar" :src="`data:image/png;base64,${avatar}`" alt="User Avatar" />
                    <div v-else class="avatar-skeleton"></div>
                </div>
                <span class="username-info">{{ userName }}</span>
            </div>
            <div v-else class="author-error">获取作者信息失败</div>
        </span>

        <!-- 毛玻璃遮罩层 -->
        <div class="overlay" v-if="isOverlayOpen" @click="closeOverlay">
            <img :src="img_url ? `data:image/png;base64,${img_url}` : '/images/default_image.jpg'" alt="Overlay Image"
                class="overlay-image" />
        </div>

        <!-- 关闭按钮 -->
        <button class="close-btn" @click="closeArticleInner">✖</button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import userApi from "../../api/modules/userApi";

const props = defineProps({
    article: {
        type: Object,
        required: true
    },
    article_inner: {
        type: Boolean,
        required: true
    },
    currentUserId: {
        type: [String, Number],
        required: true
    }
});

const emit = defineEmits(['close']);

// 从 props 解构数据
const {
    title: articleTitle,
    img_url,
    author_id,
    content,
    publication_time,
    address,
} = props.article;

interface UserInfo {
    username?: string;
    avatar_base64?: string;
    [key: string]: any;
}

// 状态数据
const userInfo = ref<UserInfo>({});
const userName = ref("");
const avatar = ref("");
const isOverlayOpen = ref(false);
const isLoading = ref(true);

// 计算属性
const isTallImage = computed(() => {
    if (img_url) {
        const img = new Image();
        img.src = `data:image/png;base64,${img_url}`;
        return img.height > img.width;
    }
    return false;
});

// 计算 localArticleInner
const localArticleInner = computed(() => props.article_inner);

// 数据加载逻辑
async function loadArticleData() {
    try {
        userName.value = "";
        avatar.value = "";
        const result = await userApi.SearchUserById(author_id);
        console.log('Author API Response:', result);
        if (result.data?.data?.[0]) {
            userInfo.value = result.data.data[0];
            userName.value = userInfo.value.username || '';
            avatar.value = userInfo.value.avatar_base64 || '';
        }
    } catch (error) {
        console.error("加载文章数据失败：", error);
    } finally {
        isLoading.value = false;
    }
}

// 遮罩层逻辑
function openOverlay() {
    isOverlayOpen.value = true;
}

function closeOverlay() {
    isOverlayOpen.value = false;
}

// 关闭文章详情的逻辑
function closeArticleInner() {
    emit('close');
}

onMounted(loadArticleData);
</script>

<style scoped>
.article-inner {
    width: 800px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 24px;
    overflow-y: auto;
    max-height: 90vh;
}

.article_img_inner {
    display: block;
    width: 100%;
    max-height: 400px;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 20px;
    cursor: pointer;
}

.article_img_inner img {
    width: 100%;
    height: auto;
    object-fit: contain;
}

.article_img_inner img.fit-height {
    height: 400px;
    width: auto;
    margin: 0 auto;
    display: block;
}

.article_img_inner img.fit-width {
    width: 100%;
    height: auto;
}

.user-inner {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 16px;
}

.avatar-container {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
}

.avatar-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.username-info {
    font-size: 16px;
    font-weight: 500;
    color: #333;
}

.article-content {
    padding: 0 20px;
}

.inner-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
}

.inner-content {
    font-size: 16px;
    line-height: 1.8;
    color: #666;
    margin-bottom: 24px;
}

.date {
    font-size: 14px;
    color: #999;
    margin-bottom: 16px;
}

.end {
    text-align: center;
    color: #999;
    margin: 32px 0;
    font-size: 14px;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.overlay-image {
    max-width: 90%;
    max-height: 90vh;
    object-fit: contain;
}

.mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
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

.author-loading {
    text-align: center;
    color: #666;
    padding: 12px;
    margin-top: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

.author-error {
    color: #f56c6c;
    text-align: center;
    padding: 12px;
    margin-top: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

.avatar-skeleton {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #eee;
}
</style>