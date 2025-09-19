import axiosInstance from "./axiosInstance";

const messageApi = {
    // 获取会话中的消息列表
    getMessages(conversation_id, page = 1, page_size = 20) {
        return axiosInstance.get(`/messages/${conversation_id}`, {
            params: {
                page,
                page_size
            }
        });
    },

    // 发送文本消息
    sendTextMessage(conversation_id, sender_id, content) {
        return axiosInstance.post('/messages/text', null, {
            params: {
                conversation_id,
                sender_id,
                content
            }
        });
    },

    // 发送图片消息
    sendImageMessage(conversation_id, sender_id, image) {
        const formData = new FormData();
        formData.append('conversation_id', conversation_id);
        formData.append('sender_id', sender_id);
        formData.append('image', image);

        return axiosInstance.post('/messages/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 发送Base64格式的图片消息
    sendBase64ImageMessage(conversation_id, sender_id, base64Image) {
        return axiosInstance.post('/messages/base64-image', null, {
            params: {
                conversation_id,
                sender_id,
                base64Image
            }
        });
    },

    // 标记消息为已读
    markMessagesAsRead(conversation_id, reader_id) {
        return axiosInstance.put('/messages/read', null, {
            params: {
                conversation_id,
                reader_id
            }
        });
    },

    // 获取未读消息数量
    getUnreadCount(conversation_id, user_id) {
        return axiosInstance.get('/messages/unread', {
            params: {
                conversation_id,
                user_id
            }
        });
    }
};

export default messageApi; 