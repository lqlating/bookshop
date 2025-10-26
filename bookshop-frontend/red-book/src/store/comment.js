// store/comment.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import commentApi from '../api/commentApi';

export const commentInfoStore = defineStore('comment', () => {
    const commentsByArticleId = ref({});
    const subCommentsByParentId = ref({});
    const commentCountByArticleId = ref({});
    const tempSubComment = ref({
        content: '',
        article_id: null,
        user_id: null,
        parent_id: null,
    });
    const grandparent_id = ref(null);

    // 加载根评论
    async function getComments(article_id) {
        try {
            const res = await commentApi.getCommentBylikeCount(article_id);
            if (!commentsByArticleId.value[article_id]) {
                commentsByArticleId.value[article_id] = [];
            }
            commentsByArticleId.value[article_id].length = 0;
            commentsByArticleId.value[article_id].push(...res.data.data);
        } catch (error) {
            console.error('获取评论失败:', error);
        }
    }

    // 获取评论数量
    async function getCommentCount(article_id) {
        try {
            const res = await commentApi.GetCommentCount(article_id);
            commentCountByArticleId.value[article_id] = res.data;
        } catch (error) {
            console.error('获取评论数量失败:', error);
        }
    }

    // 加载子评论
    async function getSubComments(parent_id) {
        try {
            const res = await commentApi.getCommentsByParentId(parent_id);
            if (!subCommentsByParentId.value[parent_id]) {
                subCommentsByParentId.value[parent_id] = [];
            }
            subCommentsByParentId.value[parent_id].length = 0;
            subCommentsByParentId.value[parent_id].push(...res.data.data);
        } catch (error) {
            console.error('获取子评论失败:', error);
        }
    }

    // 回复根评论
    async function submitComment(comment) {
        try {
            // 导入脏话过滤工具
            const { containsDirtyWords } = await import('../utils/formValidation');

            // 检查评论内容是否包含脏话
            if (containsDirtyWords(comment.content)) {
                ElMessage.error('评论包含不适当的内容，请修改后再发送');
                return false;
            }

            const response = await commentApi.addComment(comment);
            if (response.data.code === 1) {
                ElMessage.success('评论添加成功');
                await getComments(comment.article_id);
                await getCommentCount(comment.article_id); // 更新评论数量
                return true;
            } else {
                ElMessage.error(`评论添加失败: ${response.data.msg}`);
                return false;
            }
        } catch (error) {
            console.error('评论添加失败:', error);
            ElMessage.error('评论添加失败，请稍后重试');
            return false;
        }
    }

    // 回复子评论
    async function submitSubComment() {
        try {
            // 导入脏话过滤工具
            const { containsDirtyWords } = await import('../utils/formValidation');

            // 检查评论内容是否包含脏话
            if (containsDirtyWords(tempSubComment.value.content)) {
                ElMessage.error('评论包含不适当的内容，请修改后再发送');
                return false;
            }

            const response = await commentApi.addComment(tempSubComment.value);
            if (response.data.code === 1) {
                ElMessage.success('评论添加成功');

                await getSubComments(grandparent_id.value);
                await getCommentCount(tempSubComment.value.article_id); // 更新评论数量
                tempSubComment.value.content = '';
                // tempSubComment.value.article_id = null;
                // tempSubComment.value.user_id = null;
                tempSubComment.value.parent_id = null;
                grandparent_id.value = null;
                return true;
            } else {
                ElMessage.error(`评论添加失败: ${response.data.msg}`);
                return false;
            }
        } catch (error) {
            console.error('评论添加失败:', error);
            ElMessage.error('评论添加失败，请稍后重试');
            return false;
        }
    }

    // 删除评论
    async function deleteComment(commentId, articleId, parentId = null) {
        try {
            const response = await commentApi.deleteComment(commentId);

            if (response.data && response.data.code === 1) {
                ElMessage.success('评论删除成功');

                // 如果是根评论，从根评论列表中删除
                if (!parentId && articleId) {
                    if (commentsByArticleId.value[articleId]) {
                        const index = commentsByArticleId.value[articleId].findIndex(
                            comment => comment.comment_id === commentId
                        );
                        if (index !== -1) {
                            commentsByArticleId.value[articleId].splice(index, 1);
                        }
                    }
                }

                // 如果是子评论，从子评论列表中删除
                if (parentId) {
                    if (subCommentsByParentId.value[parentId]) {
                        const index = subCommentsByParentId.value[parentId].findIndex(
                            comment => comment.comment_id === commentId
                        );
                        if (index !== -1) {
                            subCommentsByParentId.value[parentId].splice(index, 1);
                        }
                    }
                }

                // 更新评论数量
                if (articleId) {
                    await getCommentCount(articleId);
                }

                return { success: true, message: response.data.data || '评论删除成功' };
            } else {
                ElMessage.error(response.data?.data || '删除评论失败');
                return { success: false, message: response.data?.data || '删除评论失败' };
            }
        } catch (error) {
            console.error('删除评论时出错:', error);
            ElMessage.error('删除评论失败，请稍后重试');
            return { success: false, message: '删除评论失败，请稍后重试' };
        }
    }

    return {
        submitComment,
        getComments,
        getCommentCount,
        commentsByArticleId,
        commentCountByArticleId,
        getSubComments,
        subCommentsByParentId,
        submitSubComment,
        tempSubComment,
        grandparent_id,
        deleteComment,
    };
});
