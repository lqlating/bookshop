import { defineStore } from 'pinia'
import { ref } from 'vue'
import titleApi from '@/api/modules/titleApi'
import { ElMessage } from 'element-plus'

export const useTitlesStore = defineStore('titles', () => {
    // 存储所有标题列表
    const titleList = ref([])
    // 存储当前查询到的单个标题
    const currentTitle = ref(null)
    // 加载状态
    const loading = ref(false)

    // 获取所有标题
    const getAllTitles = async () => {
        try {
            loading.value = true
            const res = await titleApi.getAllTitles()
            if (res.data && res.data.code === 1) {
                titleList.value = res.data.data || []
                return res.data.data
            } else {
                ElMessage.warning(res.data?.msg || '获取标题列表失败')
                return []
            }
        } catch (error) {
            console.error('获取标题列表失败:', error)
            ElMessage.error('获取标题列表失败')
            return []
        } finally {
            loading.value = false
        }
    }

    // 根据标题名称查询
    const getTitleByName = async (title) => {
        try {
            loading.value = true
            const res = await titleApi.getTitleByName(title)
            if (res.data && res.data.code === 1) {
                currentTitle.value = res.data.data
                return res.data.data
            } else {
                currentTitle.value = null
                ElMessage.warning(res.data?.msg || '未找到匹配的标题')
                return null
            }
        } catch (error) {
            console.error('查询标题失败:', error)
            ElMessage.error('查询标题失败')
            currentTitle.value = null
            return null
        } finally {
            loading.value = false
        }
    }

    // 添加新标题
    const insertTitle = async (title, value) => {
        try {
            loading.value = true
            const titleData = { title, value }
            const res = await titleApi.insertTitle(titleData)
            if (res.data && res.data.code === 1) {
                ElMessage.success('添加标题成功')
                // 刷新标题列表
                await getAllTitles()
                return true
            } else {
                ElMessage.error(res.data?.msg || '添加标题失败')
                return false
            }
        } catch (error) {
            console.error('添加标题失败:', error)
            ElMessage.error('添加标题失败')
            return false
        } finally {
            loading.value = false
        }
    }

    // 删除标题
    const deleteTitle = async (id) => {
        try {
            loading.value = true
            const res = await titleApi.deleteTitle(id)
            if (res.data && res.data.code === 1) {
                ElMessage.success('删除标题成功')
                // 从列表中移除被删除的标题
                titleList.value = titleList.value.filter(item => item.id !== id)
                return true
            } else {
                ElMessage.error(res.data?.msg || '删除标题失败')
                return false
            }
        } catch (error) {
            console.error('删除标题失败:', error)
            ElMessage.error('删除标题失败')
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        titleList,
        currentTitle,
        loading,
        getAllTitles,
        getTitleByName,
        insertTitle,
        deleteTitle
    }
}) 