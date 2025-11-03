import { defineStore } from 'pinia'
import { ref } from 'vue'
import articleApi from '@/api/modules/articleApi'
import type { Article } from '@/types/article'
import { ElMessage } from 'element-plus'

interface PaginationParams {
    page?: number
    size?: number
}

export const useArticlesStore = defineStore('articles', () => {
    const articleList = ref<Article[]>([])
    const bannedArticles = ref<Article[]>([])
    const loading = ref(false)

    const getPendingArticles = async (params: PaginationParams = { page: 1, size: 10 }) => {
        try {
            const res = await articleApi.getPendingArticles({
                page: params.page || 1,
                size: params.size || 10
            })
            articleList.value = res.data.data || []
        } catch (error) {
            console.error('获取待审核文章失败:', error)
            ElMessage.error('获取待审核文章失败')
            throw error
        }
    }

    const getBannedArticles = async (params: PaginationParams = { page: 1, size: 10 }) => {
        try {
            const res = await articleApi.getBannedArticles({
                page: params.page || 1,
                size: params.size || 10
            })
            bannedArticles.value = res.data.data || []
        } catch (error) {
            console.error('获取已封禁文章失败:', error)
            ElMessage.error('获取已封禁文章失败')
            throw error
        }
    }

    const setReviewed = async (articleId: number) => {
        try {
            await articleApi.setReviewed(articleId)
        } catch (error) {
            console.error('审核文章失败:', error)
            throw error
        }
    }

    const setReviewedAndBanned = async (articleId: number) => {
        try {
            await articleApi.setReviewedAndBanned(articleId)
        } catch (error) {
            console.error('封禁文章失败:', error)
            throw error
        }
    }

    const unbanArticle = async (articleId: number) => {
        try {
            await articleApi.unbanArticle(articleId)
        } catch (error) {
            console.error('解封文章失败:', error)
            throw error
        }
    }

    return {
        articleList,
        bannedArticles,
        loading,
        getPendingArticles,
        getBannedArticles,
        setReviewed,
        setReviewedAndBanned,
        unbanArticle
    }
})