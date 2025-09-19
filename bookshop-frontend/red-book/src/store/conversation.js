import { defineStore } from 'pinia';
import { reactive } from 'vue';
import conversationApi from '../api/conversationApi';

export const conversationStore = defineStore('conversation', () => {
    // 响应式状态
    const conversations = reactive([]);
    const messageMap = reactive({}); // 以会话ID为key的消息映射
    const unreadCountMap = reactive({}); // 以会话ID为key的未读消息数映射
    const totalUnreadCount = reactive({ value: 0 });
    const otherUserMap = reactive({}); // 以会话ID为key的对方用户信息映射

    // 获取用户的所有会话列表
    async function fetchConversations(userId) {
        try {
            console.log('开始获取会话列表，用户ID:', userId);
            const res = await conversationApi.getConversations(userId);
            Object.assign(conversations, res.data.data);

            // 预处理会话数据，提取对方用户信息和未读消息数
            conversations.forEach(conversation => {
                // 存储目标用户信息
                otherUserMap[conversation.id] = conversation.target_user;

                // 计算未读消息数 (从 low_unread 或 high_unread 获取)
                const isLowUser = userId === conversation.user_low_id;
                const unreadCount = isLowUser ?
                    (conversation.low_unread || 0) :
                    (conversation.high_unread || 0);

                unreadCountMap[conversation.id] = unreadCount;

                // 如果有未读计数字段，也使用它
                if (conversation.unread_count !== null && conversation.unread_count !== undefined) {
                    unreadCountMap[conversation.id] = conversation.unread_count;
                }
            });

            console.log('会话列表获取完成，总数:', conversations.length);
            console.log('对方用户映射:', JSON.parse(JSON.stringify(otherUserMap)));
            console.log('未读消息映射:', JSON.parse(JSON.stringify(unreadCountMap)));
        } catch (error) {
            console.error("获取会话列表失败:", error);
            throw error;
        }
    }

    // 获取对方用户信息
    function getOtherUser(conversationId) {
        return otherUserMap[conversationId] || null;
    }

    // 获取未读消息数
    function getUnreadCount(conversationId) {
        return unreadCountMap[conversationId] || 0;
    }

    // 判断是否是对方的消息
    function isOtherUserMessage(message, currentUserId) {
        return message && message.sender_id !== currentUserId;
    }

    // 创建新会话
    async function createConversation(userId, targetUserId) {
        try {
            const res = await conversationApi.createConversation(userId, targetUserId);
            const newConversation = res.data.data;
            conversations.push(newConversation);

            // 存储目标用户信息
            otherUserMap[newConversation.id] = newConversation.target_user;

            // 初始化未读消息数为0
            unreadCountMap[newConversation.id] = 0;

            return newConversation;
        } catch (error) {
            console.error("创建会话失败:", error);
            throw error;
        }
    }

    // 获取会话消息
    async function fetchMessages(conversationId, page = 1, pageSize = 20) {
        try {
            console.log('开始获取会话消息，会话ID:', conversationId);
            const res = await conversationApi.getMessages(conversationId, page, pageSize);
            messageMap[conversationId] = res.data.data;
            console.log('会话消息获取完成，消息数:', messageMap[conversationId].length);
            return messageMap[conversationId];
        } catch (error) {
            console.error("获取消息失败:", error);
            throw error;
        }
    }

    // 获取指定会话的消息
    function getMessages(conversationId) {
        return messageMap[conversationId] || [];
    }

    // 发送文本消息
    async function sendTextMessage(conversationId, senderId, content) {
        try {
            const res = await conversationApi.sendTextMessage(conversationId, senderId, content);
            if (!messageMap[conversationId]) {
                messageMap[conversationId] = [];
            }
            messageMap[conversationId].push(res.data.data);

            // 更新会话的最后一条消息
            await updateConversationLastMessage(conversationId, content, 'text');

            return res.data.data;
        } catch (error) {
            console.error("发送文本消息失败:", error);
            throw error;
        }
    }

    // 发送图片消息
    async function sendImageMessage(conversationId, senderId, image) {
        try {
            const res = await conversationApi.sendImageMessage(conversationId, senderId, image);
            if (!messageMap[conversationId]) {
                messageMap[conversationId] = [];
            }
            messageMap[conversationId].push(res.data.data);

            // 更新会话的最后一条消息
            await updateConversationLastMessage(conversationId, '[图片]', 'image');

            return res.data.data;
        } catch (error) {
            console.error("发送图片消息失败:", error);
            throw error;
        }
    }

    // 更新会话的最后一条消息
    function updateConversationLastMessage(conversationId, content, type) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.last_message = content;
            conversation.last_message_type = type;
            conversation.last_message_time = new Date().toISOString();
        }
    }

    // 标记消息为已读
    async function markMessagesAsRead(conversationId, readerId) {
        try {
            await conversationApi.markMessagesAsRead(conversationId, readerId);

            // 更新未读消息数
            unreadCountMap[conversationId] = 0;

            // 更新会话中的未读消息数
            const conversation = conversations.find(c => c.id === conversationId);
            if (conversation) {
                const isLowUser = readerId === conversation.user_low_id;
                if (isLowUser) {
                    conversation.low_unread = 0;
                } else {
                    conversation.high_unread = 0;
                }
                // 也更新统一的未读计数字段
                if (conversation.unread_count !== undefined) {
                    conversation.unread_count = 0;
                }
            }

            await updateTotalUnreadCount(readerId);
        } catch (error) {
            console.error("标记消息已读失败:", error);
            throw error;
        }
    }

    // 获取未读消息数
    async function fetchUnreadCount(conversationId, userId) {
        try {
            const res = await conversationApi.getUnreadCount(conversationId, userId);
            unreadCountMap[conversationId] = res.data.data;
            return unreadCountMap[conversationId];
        } catch (error) {
            console.error("获取未读消息数失败:", error);
            throw error;
        }
    }

    // 获取总未读消息数
    async function updateTotalUnreadCount(userId) {
        try {
            const res = await conversationApi.getTotalUnreadCount(userId);
            totalUnreadCount.value = res.data.data;
            return totalUnreadCount.value;
        } catch (error) {
            console.error("获取总未读消息数失败:", error);
            throw error;
        }
    }

    // 清空当前会话消息
    function clearCurrentConversation(conversationId) {
        if (conversationId) {
            messageMap[conversationId] = [];
        } else {
            Object.keys(messageMap).forEach(key => {
                messageMap[key] = [];
            });
        }
    }

    return {
        conversations,
        messageMap,
        unreadCountMap,
        totalUnreadCount,
        otherUserMap,
        fetchConversations,
        getOtherUser,
        getUnreadCount,
        isOtherUserMessage,
        createConversation,
        fetchMessages,
        getMessages,
        sendTextMessage,
        sendImageMessage,
        markMessagesAsRead,
        fetchUnreadCount,
        updateTotalUnreadCount,
        clearCurrentConversation
    };
}); 