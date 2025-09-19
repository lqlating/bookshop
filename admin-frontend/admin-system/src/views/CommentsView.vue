<template>
    <div class="comments-container">
        <h2>评论管理</h2>
        <DataList :pending-data="[]" :reported-data="reportedComments" :normal-data="bannedComments"
            @row-click="handleRowClick" :show-pending="false" default-active-tab="reported" content-type="comment">
            <template #default="{ row }">
                <el-table-column prop="comment_id" label="ID" width="80" />
                <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
                <el-table-column label="用户" min-width="120" show-overflow-tooltip>
                    <template #default="scope">
                        {{ scope.row.user_name || `用户ID: ${scope.row.user_id}` }}
                    </template>
                </el-table-column>
                <el-table-column label="类型" min-width="100">
                    <template #default="scope">
                        <el-tag type="info">
                            {{ getCommentType(scope.row) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="publish_time" label="发布时间" min-width="160" />
                <el-table-column label="状态" min-width="100">
                    <template #default="scope">
                        <el-tag type="danger" v-if="scope.row.is_banned === 1">
                            已封禁
                        </el-tag>
                        <el-tag type="warning" v-else-if="scope.row.report_id">
                            被举报
                        </el-tag>
                        <el-tag type="warning" v-else>
                            被举报
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="report_count" label="举报次数" width="100" />
                <el-table-column label="举报原因" min-width="150" show-overflow-tooltip>
                    <template #default="scope">
                        <span v-if="scope.row.report_reason">{{ scope.row.report_reason }}</span>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="scope">
                        <!-- 被举报评论显示忽略和封禁按钮 -->
                        <template v-if="scope.row.is_banned === 0">
                            <el-button size="small" type="success" @click.stop="handleIgnoreReport(scope.row)">
                                忽略
                            </el-button>
                            <el-button size="small" type="danger" @click.stop="handleBan(scope.row.comment_id)">
                                封禁
                            </el-button>
                        </template>
                        <!-- 已封禁评论显示解封按钮 -->
                        <template v-else>
                            <el-button size="small" type="primary" @click.stop="handleUnban(scope.row.comment_id)">
                                解封
                            </el-button>
                        </template>
                    </template>
                </el-table-column>
            </template>
        </DataList>

        <!-- 评论详情弹窗 -->
        <transition name="fade">
            <div v-if="selectedComment" class="comment-detail-overlay" @click.self="closeCommentDetail">
                <comment-detail :comment="selectedComment" @close="closeCommentDetail" />
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import DataList from '../components/DataList.vue'
import CommentDetail from '../components/comment/comment_detail.vue'
import { useCommentsStore } from '@/store/comments'
import type { Comment } from '@/types/comment'
import { ElMessage } from 'element-plus'
import reportApi from '@/api/modules/reportApi'
import commentApi from '@/api/modules/commentApi'

const commentsStore = useCommentsStore()
const { bannedComments } = storeToRefs(commentsStore)
const { getBannedComments, setReviewedAndBanned, unbanComment } = commentsStore

const reportedComments = ref<Comment[]>([])
const selectedComment = ref<Comment | null>(null)

// 获取评论类型
const getCommentType = (comment: Comment): string => {
    if (comment.target_type) {
        return comment.target_type === 'article' ? '文章' : '书籍'
    }
    if (comment.article_id) {
        return '文章'
    }
    if (comment.parent_id) {
        return '回复'
    }
    return '未知'
}

interface CommentWithMissingUserId extends Comment {
    missing_user_id?: boolean;
}

const handleRowClick = (row: Comment) => {
    // 确保评论对象有有效的用户ID
    if (row && typeof row.user_id === 'number' && row.user_id > 0) {
        selectedComment.value = row
    } else {
        // 处理无效用户ID情况
        ElMessage.warning('这条评论没有有效的用户ID')
        console.warn('评论记录无有效用户ID:', row)
        // 仍然显示评论，但会设置一个标记
        selectedComment.value = { ...row, missing_user_id: true } as CommentWithMissingUserId
    }
}

const closeCommentDetail = () => {
    selectedComment.value = null
}

const fetchData = async () => {
    try {
        // 获取已封禁评论
        await getBannedComments()
        console.log('已封禁评论:', bannedComments.value)

        // 获取被举报的评论
        try {
            const reportRes = await reportApi.getReportsByCommentType()
            console.log('评论举报数据 API 返回:', reportRes)

            // 检查是否有数据
            if (reportRes.data && reportRes.data.data) {
                const reports = reportRes.data.data

                // 检查报告内容
                console.log('报告内容样例:', reports.length > 0 ? reports[0] : '无数据')

                // 按照评论ID对举报进行分组
                const reportGroups: Record<number, any[]> = {};

                // 将报告按内容ID分组
                reports.forEach((report: any) => {
                    if (!report.report_content_id) return;

                    // 如果该内容ID已被封禁，跳过
                    if (bannedComments.value.some(banned => banned.comment_id === report.report_content_id)) {
                        return;
                    }

                    if (!reportGroups[report.report_content_id]) {
                        reportGroups[report.report_content_id] = [];
                    }
                    reportGroups[report.report_content_id].push(report);
                });

                console.log('分组后的评论举报:', reportGroups);

                // 获取被举报评论的详细信息
                const reportedCommentsDetails: Comment[] = [];

                // 处理每组举报
                for (const commentId in reportGroups) {
                    const numericCommentId = Number(commentId);
                    const commentReports = reportGroups[numericCommentId];

                    try {
                        // 获取评论详情
                        const commentRes = await commentApi.findCommentsByCommentId(numericCommentId);
                        if (commentRes.data?.data?.length > 0) {
                            const commentDetail = commentRes.data.data[0];

                            // 合并举报原因
                            const uniqueReasons = new Set<string>();
                            commentReports.forEach(report => {
                                if (report.report_reason) uniqueReasons.add(report.report_reason);
                            });

                            // 创建合并后的举报原因
                            const mergedReasons = Array.from(uniqueReasons).join('; ');

                            // 扩展评论对象以添加举报相关字段
                            reportedCommentsDetails.push({
                                ...commentDetail,
                                is_reported: 1,
                                report_reason: mergedReasons,
                                report_count: commentReports.length,
                                report_id: commentReports[0].report_id // 保留第一个举报ID用于操作
                            } as Comment);
                        }
                    } catch (error) {
                        console.error(`获取评论ID=${numericCommentId}详情失败:`, error);
                    }
                }

                reportedComments.value = reportedCommentsDetails;
                console.log('处理后的被举报评论:', reportedComments.value)
            } else {
                reportedComments.value = []
                console.log('没有评论举报数据')
            }
        } catch (error) {
            console.error('获取举报数据失败:', error)
            reportedComments.value = []
        }

    } catch (error) {
        console.error('获取数据失败:', error)
        ElMessage.error('获取评论失败')
    }
}

onMounted(fetchData)

const handleIgnoreReport = async (row: any) => {
    try {
        // 检查是否有report_id
        if (!row.report_id) {
            console.error('缺少举报ID:', row);
            ElMessage.warning('无法确定要忽略的举报ID');
            return;
        }

        console.log('忽略举报ID:', row.report_id);
        // 调用删除举报API
        const res = await reportApi.deleteReport(row.report_id);
        console.log('删除举报返回:', res);

        if (res.data && res.data.code === 1) {
            ElMessage.success('已忽略举报');
            // 从举报列表中移除该评论
            reportedComments.value = reportedComments.value.filter(
                comment => comment.report_id !== row.report_id
            );
        } else {
            throw new Error(res.data?.msg || '忽略举报失败');
        }
    } catch (error: any) {
        console.error('忽略举报失败:', error);
        ElMessage.error(`操作失败: ${error.message || '未知错误'}`);
    }
}

const handleBan = async (commentId: number) => {
    try {
        await setReviewedAndBanned(commentId)
        ElMessage.success('封禁成功')
        await fetchData()
    } catch (error) {
        ElMessage.error('操作失败')
    }
}

const handleUnban = async (commentId: number) => {
    try {
        await unbanComment(commentId)
        ElMessage.success('解封成功')
        await fetchData()
    } catch (error) {
        ElMessage.error('操作失败')
    }
}
</script>

<style scoped>
.comments-container {
    min-height: calc(100vh - 40px);
    position: relative;
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

:deep(.el-button) {
    margin: 0 4px;
}

:deep(.el-tag) {
    margin: 0 4px;
}

/* 评论详情遮罩层 */
.comment-detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>