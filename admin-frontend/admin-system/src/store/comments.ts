import { defineStore } from 'pinia'
import { ref } from 'vue'
import commentApi from '@/api/modules/commentApi'
import type { Comment } from '@/types/comment'
import { ElMessage } from 'element-plus'

export const useCommentsStore = defineStore('comments', () => {
    const commentList = ref<Comment[]>([])
    const bannedComments = ref<Comment[]>([])
    const loading = ref(false)

    // 获取待审核评论 - 实际上后端没有专门的API，我们使用模拟数据
    const getPendingComments = async () => {
        try {
            loading.value = true
            // 模拟一些数据，因为后端没有获取未审核评论的API
            commentList.value = [
                // 这里可以添加一些模拟数据
            ]

            console.log('使用模拟数据，因为后端没有getUnreviewedComments接口')
        } catch (error) {
            console.error('获取待审核评论失败:', error)
            ElMessage.error('获取待审核评论失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 获取已封禁评论
    const getBannedComments = async () => {
        try {
            loading.value = true
            const res = await commentApi.getBannedComments()
            bannedComments.value = res.data.data || []

            // 转换数据，确保前端显示需要的字段
            bannedComments.value.forEach(comment => {
                // 确保target_type字段存在，如果评论是针对文章的
                if (comment.article_id && !comment.target_type) {
                    comment.target_type = 'article'
                    comment.target_id = comment.article_id
                }
            })
        } catch (error) {
            console.error('获取已封禁评论失败:', error)
            ElMessage.error('获取已封禁评论失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 审核通过评论 - 后端没有对应API，实际上应该是将举报标记移除
    const setReviewed = async (commentId: number) => {
        try {
            loading.value = true
            // 从前端移除举报标记
            commentList.value = commentList.value.map(comment => {
                if (comment.comment_id === commentId) {
                    return {
                        ...comment,
                        is_reported: 0
                    }
                }
                return comment
            })
            ElMessage.success('已忽略举报')
        } catch (error) {
            console.error('审核评论失败:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 审核并封禁评论 - 使用banComment接口
    const setReviewedAndBanned = async (commentId: number) => {
        try {
            loading.value = true
            const res = await commentApi.banComment(commentId)
            if (res.data && res.data.code === 1) {
                // 成功封禁，移除待审核列表中的评论
                commentList.value = commentList.value.filter(
                    comment => comment.comment_id !== commentId
                )
                // 重新获取封禁列表
                await getBannedComments()
            } else {
                throw new Error(res.data?.msg || '封禁失败')
            }
        } catch (error) {
            console.error('封禁评论失败:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 解封评论
    const unbanComment = async (commentId: number) => {
        try {
            loading.value = true
            const res = await commentApi.unbanComment(commentId)
            if (res.data && res.data.code === 1) {
                // 成功解封，移除封禁列表中的评论
                bannedComments.value = bannedComments.value.filter(
                    comment => comment.comment_id !== commentId
                )
            } else {
                throw new Error(res.data?.msg || '解封失败')
            }
        } catch (error) {
            console.error('解封评论失败:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 根据用户ID获取评论
    const getCommentsByUserId = async (userId: number) => {
        try {
            loading.value = true
            const res = await commentApi.getCommentsByUserId(userId)
            return res.data.data || []
        } catch (error) {
            console.error('获取用户评论失败:', error)
            ElMessage.error('获取用户评论失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 根据文章ID获取评论（按时间排序）
    const getCommentsByArticleId = async (articleId: number) => {
        try {
            loading.value = true
            const res = await commentApi.getCommentByTime(articleId)
            return res.data.data || []
        } catch (error) {
            console.error('获取文章评论失败:', error)
            ElMessage.error('获取文章评论失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 添加评论
    const addComment = async (comment: Partial<Comment>) => {
        try {
            loading.value = true
            const res = await commentApi.addComment(comment)
            return res.data
        } catch (error) {
            console.error('添加评论失败:', error)
            ElMessage.error('添加评论失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        commentList,
        bannedComments,
        loading,
        getPendingComments,
        getBannedComments,
        setReviewed,
        setReviewedAndBanned,
        unbanComment,
        getCommentsByUserId,
        getCommentsByArticleId,
        addComment
    }
}) 