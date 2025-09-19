// @ts-nocheck
import axiosInstance from "../axiosInstance";

const commentApi = {
    // 获取待审核评论
    getPendingComments() {
        return axiosInstance.get('/getUnreviewedComments');
    },

    // 根据点赞数获取评论
    getCommentBylikeCount(articleId) {
        return axiosInstance.get(`/getCommentBylikeCount/${articleId}`);
    },

    // 根据时间获取评论
    getCommentByTime(articleId) {
        return axiosInstance.get(`/getCommentByTime/${articleId}`);
    },

    // 获取子评论数量
    getReplyCountByCommentId(commentId) {
        return axiosInstance.get(`/getReplyCountByCommentId/${commentId}`);
    },

    // 获取子评论
    getCommentsByParentId(parentId) {
        return axiosInstance.get(`/getCommentsByParentId/${parentId}`);
    },

    // 获取子评论数量
    getCommentCountByParentId(parentId) {
        return axiosInstance.get(`/getCommentCountByParentId/${parentId}`);
    },

    // 根据评论ID获取用户
    getUserByCommentId(commentId) {
        return axiosInstance.get(`/getUserByCommentId/${commentId}`);
    },

    // 添加评论
    addComment(comment) {
        return axiosInstance.post('/addComment', comment);
    },

    // 根据用户ID获取评论
    getCommentsByUserId(userId) {
        return axiosInstance.get(`/getCommentsByUserId/${userId}`);
    },

    // 根据评论ID查询评论
    findCommentsByCommentId(commentId) {
        return axiosInstance.get(`/byCommentId/${commentId}`);
    },

    // 获取所有被禁止的评论
    getBannedComments() {
        return axiosInstance.get('/getBannedComments');
    },

    // 将评论设为已审核（忽略举报）
    setCommentReviewed(commentId) {
        return axiosInstance.put(`/setCommentReviewed/${commentId}`);
    },

    // 将评论设为已审核且禁止
    setCommentReviewedAndBanned(commentId) {
        return axiosInstance.put(`/setCommentReviewedAndBanned/${commentId}`);
    },

    // 将评论设为禁止状态
    banComment(commentId) {
        return axiosInstance.put(`/banComment/${commentId}`);
    },

    // 解除评论的禁止状态
    unbanComment(commentId) {
        return axiosInstance.put(`/unbanComment/${commentId}`);
    }
};

export default commentApi; 