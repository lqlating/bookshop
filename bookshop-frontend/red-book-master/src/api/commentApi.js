import axiosInstance from "./axiosInstance";
import { containsDirtyWords } from "../utils/formValidation";
import { ElMessage } from "element-plus";

const commentApi = {
    // 根据喜欢的数量获取评论
    getCommentBylikeCount(article_id) {
        return axiosInstance.get(`/getCommentBylikeCount/${article_id}`);
    },

    // 根据发布时间获取评论
    getCommentByTime(article_id) {
        return axiosInstance.get(`/getCommentByTime/${article_id}`);
    },

    // 获取子评论数量
    getReplyCountByCommentId(comment_id) {
        return axiosInstance.get(`/getReplyCountByCommentId/${comment_id}`);
    },

    // 根据根评论ID获取子评论
    getCommentsByParentId(parent_id) {
        return axiosInstance.get(`/getCommentsByParentId/${parent_id}`);
    },

    // 根据根评论ID获取子评论数量
    getCommentCountByParentId(parent_id) {
        return axiosInstance.get(`/getCommentCountByParentId/${parent_id}`);
    },

    // 根据评论ID查找用户ID
    getUserByCommentId(commentId) {
        return axiosInstance.get(`/getUserByCommentId/${commentId}`);
    },

    // 添加评论
    async addComment(comment) {
        // 在 API 层检查评论内容是否包含脏话
        if (containsDirtyWords(comment.content)) {
            ElMessage.error('评论包含不适当的内容，请修改后再发送');
            return Promise.reject({ error: 'INAPPROPRIATE_CONTENT' });
        }

        return axiosInstance.post('/addComment', comment);
    },

    // 根据用户ID获取评论
    getCommentsByUserId(userId) {
        return axiosInstance.get(`/getCommentsByUserId/${userId}`);
    },

    // 根据评论ID查询评论
    findCommentByCommentId(commentId) {
        return axiosInstance.get(`/byCommentId/${commentId}`);
    },

    // 获取所有被禁用的评论
    getBannedComments() {
        return axiosInstance.get('/getBannedComments');
    },

    // 删除评论
    deleteComment(commentId) {
        return axiosInstance.delete(`/deleteComment/${commentId}`);
    },

    // 原有的方法保留
    GetCommentCount(article_id) {
        return axiosInstance.get(`/getCommentCount/${article_id}`);
    },

    BeReplyComment(user_id) {
        return axiosInstance.get(`/getCommentsByUserId/${user_id}`);
    },

    GetCommentById(comment_id) {
        return axiosInstance.get(`/byCommentId/${comment_id}`);
    },

    // 获取待审核的评论
    getUnreviewedComments() {
        return this.getBannedComments();
    },

    // 删除审核评论方法，因为后端没有对应的 API
    // reviewComment 方法已在 store 中使用前端逻辑处理
};

export default commentApi;