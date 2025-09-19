<template>
    <div class="titles-container">
        <h2>板块管理</h2>

        <!-- 添加标题表单 -->
        <div class="add-title-form">
            <el-form :inline="true" :model="titleForm">
                <el-form-item label="板块名称">
                    <el-input v-model="titleForm.title" placeholder="请输入板块名称" clearable />
                </el-form-item>
                <el-form-item label="板块值">
                    <el-input v-model="titleForm.value" placeholder="请输入板块值" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAddTitle" :loading="isSubmitting">添加板块</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 标题列表 -->
        <div class="title-list-container">
            <div class="header-with-refresh">
                <h3>板块列表</h3>
                <el-button type="primary" size="small" icon="Refresh" @click="loadTitles"
                    :loading="titlesStore.loading"></el-button>
            </div>

            <el-table :data="titlesStore.titleList" border style="width: 100%" v-loading="titlesStore.loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="title" label="板块名称" min-width="150" />
                <el-table-column prop="value" label="板块值" min-width="150" />
                <el-table-column label="操作" width="120" align="center">
                    <template #default="scope">
                        <el-button type="danger" size="small" @click="handleDeleteTitle(scope.row.id, scope.row.title)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 无数据提示 -->
            <div class="empty-data" v-if="!titlesStore.loading && titlesStore.titleList.length === 0">
                <el-empty description="暂无板块数据" />
            </div>
        </div>

        <!-- 删除确认对话框 -->
        <el-dialog v-model="deleteDialog.visible" title="确认删除" width="30%">
            <span>确定要删除板块 "{{ deleteDialog.titleName }}" 吗？此操作不可撤销。</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="deleteDialog.visible = false">取消</el-button>
                    <el-button type="danger" @click="confirmDeleteTitle" :loading="isDeleting">确认删除</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useTitlesStore } from '@/store/titles'
import { ElMessage, ElMessageBox } from 'element-plus'

// 获取标题store
const titlesStore = useTitlesStore()

// 标题表单数据
const titleForm = reactive({
    title: '',
    value: ''
})

// 加载状态
const isSubmitting = ref(false)
const isDeleting = ref(false)

// 删除对话框状态
const deleteDialog = reactive({
    visible: false,
    titleId: null,
    titleName: ''
})

// 加载标题列表
const loadTitles = async () => {
    await titlesStore.getAllTitles()
}

// 添加标题
const handleAddTitle = async () => {
    // 表单验证
    if (!titleForm.title.trim()) {
        ElMessage.warning('请输入板块名称')
        return
    }

    if (!titleForm.value.trim()) {
        ElMessage.warning('请输入板块值')
        return
    }

    isSubmitting.value = true
    try {
        const success = await titlesStore.insertTitle(titleForm.title, titleForm.value)
        if (success) {
            // 重置表单
            titleForm.title = ''
            titleForm.value = ''
        }
    } finally {
        isSubmitting.value = false
    }
}

// 删除标题（显示确认对话框）
const handleDeleteTitle = (id, title) => {
    deleteDialog.titleId = id
    deleteDialog.titleName = title
    deleteDialog.visible = true
}

// 确认删除标题
const confirmDeleteTitle = async () => {
    if (!deleteDialog.titleId) return

    isDeleting.value = true
    try {
        const success = await titlesStore.deleteTitle(deleteDialog.titleId)
        if (success) {
            deleteDialog.visible = false
        }
    } finally {
        isDeleting.value = false
    }
}

// 页面加载时获取标题列表
onMounted(() => {
    loadTitles()
})
</script>

<style scoped>
.titles-container {
    min-height: calc(100vh - 40px);
    position: relative;
    padding: 20px;
}

h2 {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    position: relative;
    padding-left: 12px;
}

h2::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 20px;
    width: 4px;
    background-color: #409eff;
    border-radius: 2px;
}

.add-title-form {
    margin-bottom: 30px;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title-list-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-with-refresh {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
}

.empty-data {
    margin: 30px 0;
}

:deep(.el-button) {
    margin: 0 4px;
}
</style>