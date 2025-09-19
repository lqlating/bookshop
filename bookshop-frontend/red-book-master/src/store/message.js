import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import messageApi from '../api/messageApi';

export const messageStore = defineStore('message', () => {
    // 消息列表
    const messages = ref([]);
    // 会话列表
    const conversations = ref([]);
    // 当前会话ID
    const currentConversationId = ref(null);
    // 加载状态
    const isLoading = ref(false);
    // 未读消息数量
    const unreadCount = ref(0);
    // 分页信息
    const pagination = reactive({
        page: 1,
        pageSize: 20,
        hasMore: true
    });

    // 获取用户的所有会话列表
    const fetchConversations = async (userId) => {
        try {
            const response = await messageApi.getConversations(userId);
            if (response.data && response.data.code === 1) {
                conversations.value = response.data.data;
            }
            return response;
        } catch (error) {
            console.error('获取会话列表失败:', error);
            ElMessage.error('获取会话列表失败，请稍后再试');
            return null;
        }
    };

    // 获取会话中的消息列表
    const fetchMessages = async (conversation_id, page = 1, page_size = 20) => {
        try {
            isLoading.value = true;
            currentConversationId.value = conversation_id;
            pagination.page = page;
            pagination.pageSize = page_size;

            const response = await messageApi.getMessages(conversation_id, page, page_size);

            if (response.data && response.data.code === 1) {
                // 如果是第一页，直接替换消息列表
                if (page === 1) {
                    messages.value = response.data.data;
                } else {
                    // 否则追加到消息列表
                    messages.value = [...messages.value, ...response.data.data];
                }

                // 判断是否还有更多消息
                pagination.hasMore = response.data.data.length === page_size;
            } else {
                ElMessage.error(response.data?.msg || '获取消息失败');
            }
        } catch (error) {
            console.error('获取消息失败:', error);
            ElMessage.error('获取消息失败，请稍后再试');
        } finally {
            isLoading.value = false;
        }
    };

    // 加载更多消息
    const loadMoreMessages = async () => {
        if (!pagination.hasMore || isLoading.value || !currentConversationId.value) return;

        await fetchMessages(currentConversationId.value, pagination.page + 1, pagination.pageSize);
    };

    // 发送文本消息
    const sendTextMessage = async (conversation_id, sender_id, content) => {
        try {
            if (!content.trim()) {
                ElMessage.warning('消息内容不能为空');
                return false;
            }

            const response = await messageApi.sendTextMessage(conversation_id, sender_id, content);

            if (response.data && response.data.code === 1) {
                // 将新消息添加到列表
                messages.value.push(response.data.data);
                // 移除成功提示，避免与组件中的提示重复
                return true;
            } else {
                ElMessage.error(response.data?.msg || '发送失败');
                return false;
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            ElMessage.error('发送失败，请稍后再试');
            return false;
        }
    };

    // 发送图片消息
    const sendImageMessage = async (conversation_id, sender_id, image) => {
        try {
            if (!image) {
                ElMessage.warning('请选择要发送的图片');
                return false;
            }

            const response = await messageApi.sendImageMessage(conversation_id, sender_id, image);

            if (response.data && response.data.code === 1) {
                // 将新消息添加到列表
                messages.value.push(response.data.data);
                ElMessage.success('图片发送成功');
                return true;
            } else {
                ElMessage.error(response.data?.msg || '发送失败');
                return false;
            }
        } catch (error) {
            console.error('发送图片失败:', error);
            ElMessage.error('发送失败，请稍后再试');
            return false;
        }
    };

    // 标记消息为已读
    const markMessagesAsRead = async (conversation_id, reader_id) => {
        try {
            const response = await messageApi.markMessagesAsRead(conversation_id, reader_id);

            if (response.data && response.data.code === 1) {
                // 如果是当前会话，更新未读消息数
                if (conversation_id === currentConversationId.value) {
                    unreadCount.value = 0;
                }
                return true;
            } else {
                console.error('标记已读失败:', response.data?.msg);
                return false;
            }
        } catch (error) {
            console.error('标记已读失败:', error);
            return false;
        }
    };

    // 获取未读消息数量
    const fetchUnreadCount = async (conversation_id, user_id) => {
        try {
            const response = await messageApi.getUnreadCount(conversation_id, user_id);

            if (response.data && response.data.code === 1) {
                unreadCount.value = response.data.data;
                return response.data.data;
            } else {
                console.error('获取未读消息数失败:', response.data?.msg);
                return 0;
            }
        } catch (error) {
            console.error('获取未读消息数失败:', error);
            return 0;
        }
    };

    // 清空当前会话
    const clearCurrentConversation = () => {
        messages.value = [];
        currentConversationId.value = null;
        pagination.page = 1;
        pagination.hasMore = true;
        unreadCount.value = 0;
    };

    return {
        messages,
        conversations,
        currentConversationId,
        isLoading,
        unreadCount,
        pagination,
        fetchConversations,
        fetchMessages,
        loadMoreMessages,
        sendTextMessage,
        sendImageMessage,
        markMessagesAsRead,
        fetchUnreadCount,
        clearCurrentConversation
    };
}); 