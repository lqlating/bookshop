import { defineStore } from 'pinia'
import { ref } from 'vue'
import reportApi from '@/api/modules/reportApi'
import { ElMessage } from 'element-plus'

export const useReportsStore = defineStore('reports', () => {
    // 存储不同类型的举报数据
    const articleReports = ref([])
    const bookReports = ref([])
    const commentReports = ref([])
    const userReports = ref([])
    const loading = ref(false)

    // 获取文章举报
    const getArticleReports = async () => {
        try {
            loading.value = true
            const res = await reportApi.getReportsByArticleType()
            articleReports.value = res.data.data || []
        } catch (error) {
            console.error('获取文章举报失败:', error)
            ElMessage.error('获取文章举报失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 获取书籍举报
    const getBookReports = async () => {
        try {
            loading.value = true
            const res = await reportApi.getReportsByBookType()
            bookReports.value = res.data.data || []
        } catch (error) {
            console.error('获取书籍举报失败:', error)
            ElMessage.error('获取书籍举报失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 获取评论举报
    const getCommentReports = async () => {
        try {
            loading.value = true
            const res = await reportApi.getReportsByCommentType()
            commentReports.value = res.data.data || []
        } catch (error) {
            console.error('获取评论举报失败:', error)
            ElMessage.error('获取评论举报失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 获取用户举报
    const getUserReports = async () => {
        try {
            loading.value = true
            const res = await reportApi.getReportsByUserType()
            userReports.value = res.data.data || []
        } catch (error) {
            console.error('获取用户举报失败:', error)
            ElMessage.error('获取用户举报失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 根据内容类型获取举报
    const getReportsByContentType = async (contentType) => {
        try {
            loading.value = true
            const res = await reportApi.getReportsByContentType(contentType)
            return res.data.data || []
        } catch (error) {
            console.error('获取举报失败:', error)
            ElMessage.error('获取举报失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    // 添加举报
    const addReport = async (reportData) => {
        try {
            loading.value = true
            const res = await reportApi.addReport(reportData)
            ElMessage.success('举报成功')
            return res.data
        } catch (error) {
            console.error('举报失败:', error)
            ElMessage.error('举报失败')
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        articleReports,
        bookReports,
        commentReports,
        userReports,
        loading,
        getArticleReports,
        getBookReports,
        getCommentReports,
        getUserReports,
        getReportsByContentType,
        addReport
    }
}) 