import axiosInstance from "./axiosInstance";

const conversationApi = {
    // 获取用户的所有会话列表
    getConversations(userId) {
        return axiosInstance.get(`/conversations/${userId}`);
    },

    // 创建新会话
    createConversation(userId, targetUserId) {
        return axiosInstance.post('/conversations', null, {
            params: {
                user_id: userId,
                target_user_id: targetUserId
            }
        });
    },

    // 获取会话中的消息列表
    getMessages(conversationId, page = 1, pageSize = 20) {
        return axiosInstance.get(`/conversations/${conversationId}/messages`, {
            params: {
                page,
                page_size: pageSize
            }
        });
    },

    // 发送文本消息
    sendTextMessage(conversationId, senderId, content) {
        return axiosInstance.post(`/conversations/${conversationId}/messages/text`, null, {
            params: {
                sender_id: senderId,
                content
            }
        });
    },

    // 发送图片消息
    sendImageMessage(conversationId, senderId, image) {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('sender_id', senderId);

        return axiosInstance.post(`/conversations/${conversationId}/messages/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 标记会话中的消息为已读
    markMessagesAsRead(conversationId, readerId) {
        return axiosInstance.put(`/conversations/${conversationId}/read`, null, {
            params: {
                reader_id: readerId
            }
        });
    },

    // 获取会话中的未读消息数量
    getUnreadCount(conversationId, userId) {
        return axiosInstance.get(`/conversations/${conversationId}/unread`, {
            params: {
                user_id: userId
            }
        });
    },

    // 获取用户所有会话的未读消息总数
    getTotalUnreadCount(userId) {
        return axiosInstance.get(`/conversations/total-unread/${userId}`);
    },

    // 更新会话的最后一条消息
    updateLastMessage(conversationId, content, type) {
        return axiosInstance.put(`/conversations/${conversationId}/last-message`, null, {
            params: {
                content,
                type
            }
        });
    }
};

export default conversationApi; 