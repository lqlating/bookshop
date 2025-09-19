<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { conversationStore } from '@/store/conversation';
import { messageStore } from '@/store/message';
import { userInfoStore } from '@/store/user';
import { ElMessage } from 'element-plus';

const conversationStoreInstance = conversationStore();
const messageStoreInstance = messageStore();
const userStore = userInfoStore();
const showChatDialog = ref(false);
const currentChat = ref(null);
const isLoading = ref(false);
const messageContent = ref('');

// 新增图片预览相关的响应式变量
const isPreviewVisible = ref(false);
const previewImageUrl = ref('');

// 时间格式化函数
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

// 日期格式化函数（用于时间分隔）
const formatDateDivider = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return year === now.getFullYear()
        ? `${month}月${day}日`
        : `${year}年${month}月${day}日`;
};

// 判断是否需要显示时间分隔
const shouldShowDivider = (index) => {
    if (index === 0) return true;

    const currentMsg = messageStoreInstance.messages[index];
    const prevMsg = messageStoreInstance.messages[index - 1];

    return (currentMsg.created_at - prevMsg.created_at) > 2 * 60 * 60 * 1000;
};

// 判断是否是自己发送的消息
const isCurrentUserMessage = (message) => {
    return message.sender_id === userStore.userThing.id;
};

// 获取头像URL
const getAvatarUrl = (avatarData) => {
    if (!avatarData) return '/default-avatar.png';
    if (avatarData.startsWith('data:image')) return avatarData;
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(avatarData)) {
        return `data:image/jpeg;base64,${avatarData}`;
    }
    return avatarData;
};

// 加载会话列表
const loadConversations = async () => {
    if (!userStore.isLogin) {
        showToast('请先登录');
        return;
    }
    isLoading.value = true;
    try {
        await conversationStoreInstance.fetchConversations(userStore.userThing.id);
    } catch (error) {
        console.error('加载会话列表失败:', error);
        showToast('加载会话列表失败');
    } finally {
        isLoading.value = false;
    }
};

// 显示Toast提示
const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
};

// 获取会话消息
const openChatDialog = async (conversation) => {
    console.log('Opening chat dialog with conversation:', conversation);

    // 计算滚动条宽度
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    document.body.classList.add('chat-open');

    currentChat.value = conversation;
    showChatDialog.value = true;

    try {
        await messageStoreInstance.fetchMessages(conversation.id);
        console.log('Fetched messages:', messageStoreInstance.messages);
        // 检查图片消息的格式
        messageStoreInstance.messages.forEach(msg => {
            if (msg.type === 'image') {
                console.log('Image message content:', {
                    content: msg.content,
                    type: msg.type,
                    isBase64: msg.content.startsWith('data:'),
                    length: msg.content.length
                });
            }
        });

        // 使用 conversationStore 的 markMessagesAsRead
        await conversationStoreInstance.markMessagesAsRead(conversation.id, userStore.userThing.id);
        // 更新总未读消息数
        await conversationStoreInstance.updateTotalUnreadCount(userStore.userThing.id);
        scrollToBottom();
    } catch (error) {
        console.error('Error loading messages:', error);
        showToast('加载消息失败');
    }
};

// 发送消息
const sendMessage = async () => {
    if (!messageContent.value.trim()) return;

    // 使用脏话过滤工具检查消息内容
    const { containsDirtyWords, filterDirtyWords } = await import('../../utils/formValidation');

    // 检查消息是否包含脏话
    if (containsDirtyWords(messageContent.value)) {
        ElMessage.error('消息包含不适当的内容，请修改后再发送');
        // 可选：自动过滤脏话（取消注释以启用自动过滤）
        // messageContent.value = filterDirtyWords(messageContent.value);
        return;
    }

    try {
        console.log('Sending text message:', {
            chatId: currentChat.value.id,
            content: messageContent.value
        });

        const response = await messageStoreInstance.sendTextMessage(
            currentChat.value.id,
            userStore.userThing.id,
            messageContent.value
        );

        console.log('Message sent response:', response);

        // 更新会话的最后一条消息信息
        const conversation = conversationStoreInstance.conversations.find(
            c => c.id === currentChat.value.id
        );
        if (conversation) {
            conversation.last_message = messageContent.value;
            conversation.last_message_type = 'text';
            conversation.last_message_time = new Date().toISOString();

            // 将这个会话移到列表最前面
            const index = conversationStoreInstance.conversations.indexOf(conversation);
            if (index > 0) {
                conversationStoreInstance.conversations.splice(index, 1);
                conversationStoreInstance.conversations.unshift(conversation);
            }

            // 发送消息后标记为已读
            await conversationStoreInstance.markMessagesAsRead(currentChat.value.id, userStore.userThing.id);
        }

        messageContent.value = '';
        scrollToBottom();
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('发送消息失败');
    }
};

// 发送图片
const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        showToast('请选择图片文件');
        return;
    }

    try {
        console.log('Uploading image:', {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        });

        const response = await messageStoreInstance.sendImageMessage(
            currentChat.value.id,
            userStore.userThing.id,
            file
        );

        console.log('Image upload response:', response);

        // 更新会话的最后一条消息信息
        const conversation = conversationStoreInstance.conversations.find(
            c => c.id === currentChat.value.id
        );
        if (conversation) {
            conversation.last_message = '[图片]';
            conversation.last_message_type = 'image';
            conversation.last_message_time = new Date().toISOString();

            // 将这个会话移到列表最前面
            const index = conversationStoreInstance.conversations.indexOf(conversation);
            if (index > 0) {
                conversationStoreInstance.conversations.splice(index, 1);
                conversationStoreInstance.conversations.unshift(conversation);
            }
        }

        scrollToBottom();
    } catch (error) {
        console.error('Error uploading image:', error);
        showToast('发送图片失败');
    }

    event.target.value = '';
};

// 滚动到底部
const scrollToBottom = () => {
    setTimeout(() => {
        const container = document.querySelector('.chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
    }, 50);
};

// 关闭对话框
const handleCloseDialog = () => {
    document.body.classList.remove('chat-open');
    showChatDialog.value = false;
    currentChat.value = null;
    messageContent.value = '';
};

// 定期更新未读消息数
const updateUnreadCounts = async () => {
    if (!userStore.isLogin) return;

    try {
        // 更新总未读数
        await conversationStoreInstance.updateTotalUnreadCount(userStore.userThing.id);

        // 更新每个会话的未读数
        for (const conversation of conversationStoreInstance.conversations) {
            await conversationStoreInstance.fetchUnreadCount(conversation.id, userStore.userThing.id);
        }
    } catch (error) {
        console.error('更新未读消息数失败:', error);
    }
};

// 组件挂载时开始定期更新未读消息数
onMounted(() => {
    if (userStore.isLogin) {
        loadConversations();
        // 每30秒更新一次未读消息数
        const timer = setInterval(updateUnreadCounts, 30000);
        // 组件卸载时清理定时器
        onUnmounted(() => {
            clearInterval(timer);
        });
    }
});

// 处理图片点击，可以放大查看
const handleImageClick = (imageContent) => {
    const url = imageContent.startsWith('data:') ? imageContent : `data:image/jpeg;base64,${imageContent}`;
    isPreviewVisible.value = true;
    previewImageUrl.value = url;
};

// 关闭图片预览
const closePreview = () => {
    isPreviewVisible.value = false;
    previewImageUrl.value = '';
};
</script>

<template>
    <div class="private-chat-container">
        <!-- 加载指示器 -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>

        <!-- 会话列表 -->
        <div v-if="conversationStoreInstance.conversations.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <p class="empty-text">暂无私聊消息</p>
        </div>

        <div v-else class="conversation-list">
            <div v-for="chat in conversationStoreInstance.conversations" :key="chat.id" class="conversation-item"
                @click="openChatDialog(chat)">
                <div class="avatar">
                    <img :src="getAvatarUrl(conversationStoreInstance.getOtherUser(chat.id)?.avatar_base64)"
                        :alt="conversationStoreInstance.getOtherUser(chat.id)?.username || '用户'">
                </div>
                <div class="content">
                    <div class="header">
                        <span class="username">{{ conversationStoreInstance.getOtherUser(chat.id)?.username || '未知用户'
                        }}</span>
                    </div>
                    <div class="preview">
                        {{ chat.last_message_type === 'image' ? '[图片]' : chat.last_message }}
                    </div>
                </div>
                <div class="status-wrapper">
                    <div v-if="conversationStoreInstance.getUnreadCount(chat.id) > 0" class="unread-badge">
                        {{ conversationStoreInstance.getUnreadCount(chat.id) }}
                    </div>
                    <span class="time">{{ formatTime(chat.last_message_time) }}</span>
                </div>
            </div>
        </div>

        <!-- 聊天对话框 -->
        <div v-if="showChatDialog" class="chat-dialog-overlay">
            <div class="chat-dialog">
                <div class="dialog-header">
                    <div class="header-back" @click="handleCloseDialog">‹</div>
                    <div class="header-content">
                        <div class="header-avatar">
                            <img :src="getAvatarUrl(conversationStoreInstance.getOtherUser(currentChat.id)?.avatar_base64)"
                                alt="头像">
                        </div>
                        <h3>{{ conversationStoreInstance.getOtherUser(currentChat.id)?.username || '未知用户' }}</h3>
                    </div>
                </div>

                <div class="chat-messages">
                    <template v-for="(message, index) in messageStoreInstance.messages" :key="message.id">
                        <!-- 时间分隔 -->
                        <div v-if="shouldShowDivider(index)" class="time-divider">
                            <span>{{ formatDateDivider(message.created_at) }}</span>
                        </div>

                        <!-- 消息项 -->
                        <div :class="['message-item', isCurrentUserMessage(message) ? 'self' : 'other']">
                            <!-- 对方消息 - 头像在左边 -->
                            <template v-if="!isCurrentUserMessage(message)">
                                <div class="message-avatar">
                                    <img :src="getAvatarUrl(conversationStoreInstance.getOtherUser(currentChat.id)?.avatar_base64)"
                                        alt="头像">
                                </div>
                                <div class="message-content-wrapper">
                                    <div class="message-content">
                                        <template v-if="message.message_type === 'image'">
                                            <img :src="message.content_image_base64.startsWith('data:') ? message.content_image_base64 : `data:image/jpeg;base64,${message.content_image_base64}`"
                                                class="message-image" alt="图片消息"
                                                @click="handleImageClick(message.content_image_base64)">
                                        </template>
                                        <template v-else>
                                            {{ message.content_text || message.content }}
                                        </template>
                                    </div>
                                </div>
                            </template>

                            <!-- 自己消息 - 头像在右边 -->
                            <template v-if="isCurrentUserMessage(message)">
                                <div class="message-content-wrapper">
                                    <div class="message-content">
                                        <template v-if="message.message_type === 'image'">
                                            <img :src="message.content_image_base64.startsWith('data:') ? message.content_image_base64 : `data:image/jpeg;base64,${message.content_image_base64}`"
                                                class="message-image" alt="图片消息"
                                                @click="handleImageClick(message.content_image_base64)">
                                        </template>
                                        <template v-else>
                                            {{ message.content_text || message.content }}
                                        </template>
                                    </div>
                                </div>
                                <div class="message-avatar">
                                    <img :src="getAvatarUrl(userStore.userThing.avatar_base64)" alt="头像">
                                </div>
                            </template>
                        </div>
                    </template>
                </div>

                <!-- 消息输入区域 -->
                <div class="message-input-area">
                    <label class="upload-btn">
                        <input type="file" accept="image/*" @change="handleImageUpload" hidden>
                        <span class="icon">+</span>
                    </label>
                    <input v-model="messageContent" type="text" class="message-input" placeholder="输入消息..."
                        @keyup.enter="sendMessage">
                    <button class="send-btn" @click="sendMessage">发送</button>
                </div>
            </div>
        </div>

        <!-- 添加图片预览遮罩层 -->
        <div v-if="isPreviewVisible" class="image-preview-overlay" @click="closePreview">
            <div class="preview-content">
                <img :src="previewImageUrl" alt="预览图片" class="preview-image" @click.stop>
                <button class="close-preview-btn" @click="closePreview">✖</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 基础样式 */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* 主容器 */
.private-chat-container {
    position: relative;
    height: 100%;
    padding: 12px;
    background-color: #f5f5f5;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    overflow-x: hidden;
    /* 防止水平滚动 */
}

/* 加载指示器 */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #07C160;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #999;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
}

.empty-text {
    font-size: 16px;
}

/* 会话列表 */
.conversation-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.conversation-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.conversation-item:hover {
    background-color: #f9f9f9;
}

.avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    background-color: #eee;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.content {
    flex: 1;
    min-width: 0;
    margin-right: 8px;
}

.header {
    margin-bottom: 4px;
}

.status-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    min-width: 60px;
}

.username {
    font-weight: 500;
    color: #333;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.time {
    font-size: 12px;
    color: #999;
}

.preview {
    font-size: 14px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.unread-badge {
    position: static;
    background-color: #ff2e4d;
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 12px;
    min-width: 18px;
    height: 18px;
    line-height: 14px;
    text-align: center;
    font-weight: 500;
}

/* 聊天对话框遮罩层 */
.chat-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(3px);
    padding: 20px;
    overflow-y: auto;
    /* 允许内容滚动 */
}

/* 聊天对话框 */
.chat-dialog {
    width: 100%;
    max-width: 500px;
    height: 80vh;
    max-height: 700px;
    background-color: #f5f5f5;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    margin: auto;
    /* 确保对话框居中 */
    position: relative;
    /* 确保定位正确 */
}

.dialog-header {
    padding: 12px 16px;
    background-color: white;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
    position: relative;
}

.header-back {
    font-size: 24px;
    margin-right: 12px;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-content {
    display: flex;
    align-items: center;
    flex: 1;
}

.header-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    background-color: #eee;
}

.header-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.dialog-header h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 聊天消息区域 */
.chat-messages {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: #e5e5e5;
    background-image:
        linear-gradient(rgba(200, 200, 200, 0.2) 1px, transparent 1px),
        linear-gradient(90deg, rgba(200, 200, 200, 0.2) 1px, transparent 1px);
    background-size: 20px 20px;
}

/* 时间分隔 */
.time-divider {
    display: flex;
    justify-content: center;
    margin: 12px 0;
    position: relative;
}

.time-divider::before,
.time-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    margin: auto;
}

.time-divider span {
    font-size: 12px;
    color: #999;
    padding: 0 12px;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
}

/* 消息项 */
.message-item {
    display: flex;
    max-width: 80%;
    gap: 8px;
    margin-bottom: 12px;
}

.message-item.self {
    align-self: flex-end;
}

.message-item.other {
    align-self: flex-start;
}

.message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background-color: #eee;
    align-self: flex-end;
}

.message-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.message-content-wrapper {
    display: flex;
    flex-direction: column;
    max-width: calc(100% - 44px);
}

.message-content {
    padding: 10px 14px;
    border-radius: 8px;
    word-break: break-word;
    line-height: 1.5;
    font-size: 15px;
    position: relative;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 自己消息 - 绿色气泡 */
.message-item.self .message-content {
    background-color: #07C160;
    color: white;
    border-top-right-radius: 2px;
}

/* 对方消息 - 白色气泡 */
.message-item.other .message-content {
    background-color: white;
    color: #333;
    border-top-left-radius: 2px;
}

/* 消息气泡小三角 */
.message-item.self .message-content::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 10px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 6px solid #07C160;
}

.message-item.other .message-content::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 10px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid white;
}

.message-image {
    max-width: 200px;
    max-height: 200px;
    border-radius: 4px;
    display: block;
    cursor: pointer;
    object-fit: cover;
    transition: transform 0.2s;
}

.message-image:hover {
    transform: scale(1.05);
}

/* 消息输入区域 */
.message-input-area {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background-color: white;
    border-top: 1px solid #eee;
    gap: 8px;
}

.upload-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #07C160;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
}

.upload-btn .icon {
    font-size: 20px;
    line-height: 1;
}

.message-input {
    flex: 1;
    height: 36px;
    padding: 0 12px;
    border: none;
    border-radius: 18px;
    font-size: 14px;
    outline: none;
    background-color: #f0f0f0;
}

.send-btn {
    height: 36px;
    padding: 0 16px;
    border: none;
    border-radius: 18px;
    font-size: 14px;
    background-color: #07C160;
    color: white;
    cursor: pointer;
    font-weight: 500;
}

/* Toast提示 */
.toast-message {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    opacity: 0;
    transition: all 0.3s;
    z-index: 1100;
}

.toast-message.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
}

/* 添加一个新的样式来防止body滚动 */
:root {
    --scrollbar-width: 0px;
}

body.chat-open {
    overflow: hidden;
    padding-right: var(--scrollbar-width);
    /* 补偿滚动条宽度 */
}

/* 图片预览遮罩层样式 */
.image-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    cursor: pointer;
}

.preview-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
}

.preview-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    cursor: default;
}

.close-preview-btn {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
}

.close-preview-btn:hover {
    color: #ddd;
}
</style>