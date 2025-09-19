// src/api/likeStarApi.js
import axiosInstance from "./axiosInstance";

const likeStarApi = {
    // 点赞或者收藏文章（评论）
    addOperation(userId, commentId, articleId, operationType) {
        return axiosInstance.post('/operation/add', {
            user_id: userId,
            comment_id: commentId,
            article_id: articleId,
            operation_type: operationType
        });
    },
    // 取消点赞和收藏文章（评论）
    deleteOperation(userId, commentId, articleId, operationType) {
        return axiosInstance.post('/operation/delete', {
            user_id: userId,
            comment_id: commentId,
            article_id: articleId,
            operation_type: operationType
        });
    },
    // 查询点赞和收藏文章（评论）
    searchOperation(userId, contentType, operationType) {
        return axiosInstance.post('/operation/search', {
            user_id: userId,
            content_type: contentType,
            operation_type: operationType
        });
    },
    // 查询粉丝数量
    searchCount(params) {
        return axiosInstance.post('/operation/searchCount', params);
    },
    // 新增接口：根据 target_id 数组查询点赞或收藏的数量
    searchCountByTargetIds(targetIds) {
        // 直接传递 targetIds 数组
        return axiosInstance.post('/operation/countByTargetIds', targetIds);
    }
};

export default likeStarApi;
