<template>
  <div class="articles-container">
    <h2>文章管理</h2>
    <DataList :pending-data="articleList" :reported-data="reportedArticles" :normal-data="bannedArticles"
      @row-click="handleRowClick" content-type="article">
      <template #default="{ row, activeTab }">
        <el-table-column prop="article_id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="作者" min-width="120" show-overflow-tooltip>
          <template #default="scope">
            {{ getUserName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="publication_time" label="发布时间" min-width="160" />
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag type="danger" v-if="scope.row.is_banned">
              已封禁
            </el-tag>
            <el-tag type="warning" v-else-if="scope.row.is_reported">
              被举报
            </el-tag>
            <el-tag type="info" v-else>
              待审核
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="report_count" label="举报次数" width="100" v-if="activeTab === 'reported'" />
        <el-table-column label="举报原因" min-width="150" show-overflow-tooltip v-if="activeTab !== 'banned'">
          <template #default="scope">
            <span v-if="scope.row.report_reason">{{ scope.row.report_reason }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <!-- 被举报文章显示忽略和封禁按钮 -->
            <template v-if="scope.row.is_reported && !scope.row.is_banned">
              <el-button size="small" type="success" @click.stop="handleIgnoreReport(scope.row)">
                忽略
              </el-button>
              <el-button size="small" type="danger" @click.stop="handleBan(scope.row.article_id)">
                封禁
              </el-button>
            </template>
            <!-- 未封禁且未举报文章显示通过和封禁按钮 -->
            <template v-else-if="!scope.row.is_banned && !scope.row.is_reported">
              <el-button size="small" type="success" @click.stop="handleApprove(scope.row.article_id)">
                通过
              </el-button>
              <el-button size="small" type="danger" @click.stop="handleBan(scope.row.article_id)">
                封禁
              </el-button>
            </template>
            <!-- 已封禁文章显示解封按钮 -->
            <template v-else>
              <el-button size="small" type="primary" @click.stop="handleUnban(scope.row.article_id)">
                解封
              </el-button>
            </template>
          </template>
        </el-table-column>
      </template>
    </DataList>

    <!-- 文章详情弹窗 -->
    <transition name="fade">
      <div v-if="selectedArticle" class="article-detail-overlay" @click.self="closeArticleDetail">
        <article-inner :article="selectedArticle" :article_inner="true" :current-user-id="1"
          @close="closeArticleDetail" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import DataList from '../components/DataList.vue'
import ArticleInner from '../components/article/article_inner.vue'
import { useArticlesStore } from '@/store/articles'
import type { Article } from '@/types/article'
import { ElMessage } from 'element-plus'
import reportApi from '@/api/modules/reportApi'
import articleApi from '@/api/modules/articleApi'
import userApi from '@/api/modules/userApi'

// 定义举报对象的接口
interface Report {
  report_id: number
  report_content_id: number
  report_reason: string
  reporter_id?: number
}

// 用户名缓存，避免重复请求
const userNameCache = reactive<Record<number, string>>({});

const articlesStore = useArticlesStore()
const { articleList, bannedArticles } = storeToRefs(articlesStore)
const { getPendingArticles, getBannedArticles, setReviewed, setReviewedAndBanned, unbanArticle } = articlesStore

const selectedArticle = ref<Article | null>(null)
const reportedArticles = ref<Article[]>([])

const handleRowClick = (row: Article) => {
  selectedArticle.value = row
}

const closeArticleDetail = () => {
  selectedArticle.value = null
}

// 获取用户名的函数
const getUserName = (article: any): string => {
  if (!article) return '未知';

  // 如果article对象包含作者名，直接使用
  if (article.username) return article.username;
  if (article.author_name) return article.author_name;

  // 如果存在author_id，根据ID查询用户名
  // 先检查是否有缓存
  if (article.author_id && userNameCache[article.author_id]) {
    return userNameCache[article.author_id];
  }

  // 如果没有缓存但有ID，异步获取并更新缓存
  if (article.author_id) {
    // 触发用户信息加载
    fetchUserName(article.author_id);

    // 返回临时显示内容
    return `加载中...`;
  }

  return '未知';
}

// 异步获取用户名并更新缓存
const fetchUserName = async (userId: number) => {
  try {
    if (!userId) return;

    // 如果已经在缓存中，不重复请求
    if (userNameCache[userId] && userNameCache[userId] !== '加载中...') return;

    // 标记为正在加载，避免重复请求
    userNameCache[userId] = '加载中...';

    const res = await userApi.SearchUserById(userId);

    // 从响应中提取用户数据
    if (res.data && res.data.code === 1 && res.data.data) {
      // 注意：API返回的是数组形式，需要取第一个元素
      const userData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;

      // 如果userData存在且有username字段
      if (userData && userData.username) {
        userNameCache[userId] = userData.username;
        // 强制更新组件
        setTimeout(() => {
          // 这里使用个空操作来触发组件刷新
          articleList.value = [...articleList.value];
          reportedArticles.value = [...reportedArticles.value];
          bannedArticles.value = [...bannedArticles.value];
        }, 0);
      } else {
        // 如果没有找到用户名，显示ID
        userNameCache[userId] = `用户ID: ${userId}`;
      }
    } else {
      userNameCache[userId] = `用户ID: ${userId}`;
    }
  } catch (error) {
    console.error(`获取用户ID=${userId}的信息失败:`, error);
    userNameCache[userId] = `用户ID: ${userId}`;
  }
}

const fetchData = async (preservedCache?: Record<number, string>) => {
  try {
    // 如果提供了保留的缓存，则使用它，否则清空
    if (!preservedCache) {
      // 清空用户名缓存
      Object.keys(userNameCache).forEach(key => {
        delete userNameCache[Number(key)];
      });
    } else {
      // 使用保留的缓存替换当前缓存
      Object.keys(userNameCache).forEach(key => {
        delete userNameCache[Number(key)];
      });

      // 复制缓存值
      Object.keys(preservedCache).forEach(key => {
        userNameCache[Number(key)] = preservedCache[Number(key)];
      });
    }

    await getPendingArticles()
    await getBannedArticles()
    console.log('待审核文章:', articleList.value)
    console.log('已封禁文章:', bannedArticles.value)

    // 预加载所有文章作者的用户信息
    const authorIds = new Set<number>();

    // 收集所有需要加载的作者ID
    articleList.value.forEach(article => {
      if (article.author_id) authorIds.add(article.author_id);
    });

    bannedArticles.value.forEach(article => {
      if (article.author_id) authorIds.add(article.author_id);
    });

    // 获取被举报文章
    try {
      const reportedRes = await reportApi.getReportsByArticleType()
      console.log('文章举报数据 API 返回:', reportedRes)

      // 检查是否有数据
      if (reportedRes.data && reportedRes.data.data) {
        const reports = reportedRes.data.data as Report[]

        // 检查报告内容
        console.log('报告内容样例:', reports.length > 0 ? reports[0] : '无数据')

        // 按照文章ID对举报进行分组
        const reportGroups: Record<number, Report[]> = {};

        // 将报告按内容ID分组
        reports.forEach((report: Report) => {
          if (!report.report_content_id) return;

          // 如果该内容ID已被封禁，跳过
          if (bannedArticles.value.some(banned => banned.article_id === report.report_content_id)) {
            return;
          }

          if (!reportGroups[report.report_content_id]) {
            reportGroups[report.report_content_id] = [];
          }
          reportGroups[report.report_content_id].push(report);
        });

        console.log('分组后的举报:', reportGroups);

        // 获取被举报文章的详细信息
        const reportedArticlesDetails: Article[] = [];

        // 处理每组举报
        for (const contentId in reportGroups) {
          const articleId = Number(contentId);
          const reportsForArticle = reportGroups[articleId];

          try {
            // 获取文章详情
            const articleRes = await articleApi.getArticlesByIds([articleId]);
            if (articleRes.data?.data?.length > 0) {
              const articleDetail = articleRes.data.data[0];

              // 收集作者ID
              if (articleDetail.author_id) {
                authorIds.add(articleDetail.author_id);
              }

              // 合并举报原因
              const uniqueReasons = new Set<string>();
              reportsForArticle.forEach(report => {
                if (report.report_reason) uniqueReasons.add(report.report_reason);
              });

              // 创建合并后的举报原因
              const mergedReasons = Array.from(uniqueReasons).join('; ');

              // 扩展文章对象以添加举报相关字段
              reportedArticlesDetails.push({
                ...articleDetail,
                is_reported: true,
                report_reason: mergedReasons,
                report_count: reportsForArticle.length,
                report_id: reportsForArticle[0].report_id // 保留第一个举报ID用于操作
              } as Article);
            }
          } catch (error) {
            console.error(`获取文章ID=${articleId}详情失败:`, error);
          }
        }

        reportedArticles.value = reportedArticlesDetails;
        console.log('处理后的被举报文章:', reportedArticles.value)
      } else {
        reportedArticles.value = []
        console.log('没有文章举报数据')
      }
    } catch (error) {
      console.error('获取举报数据失败:', error)
      reportedArticles.value = []
    }

    // 过滤掉待审核文章中已封禁的文章
    articleList.value = articleList.value.filter(article => !article.is_banned)

    // 批量预加载所有作者用户信息
    console.log('需要加载的作者ID数量:', authorIds.size);

    // 批量加载用户信息，使用Promise.all并行加载
    if (authorIds.size > 0) {
      const loadPromises = Array.from(authorIds).map(authorId => {
        return fetchUserName(authorId);
      });

      await Promise.all(loadPromises);
      console.log('所有用户信息加载完成');
    }

  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取文章失败')
  }
}

onMounted(async () => {
  await fetchData();
})

const handleApprove = async (articleId: number) => {
  try {
    // 保存当前缓存的用户名映射
    const cachedUserNames = { ...userNameCache };

    await setReviewed(articleId)
    ElMessage.success('审核通过成功')

    // 修改fetchData调用方式，传入保存的缓存
    await fetchData(cachedUserNames)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleBan = async (articleId: number) => {
  try {
    // 保存当前缓存的用户名映射
    const cachedUserNames = { ...userNameCache };

    await setReviewedAndBanned(articleId)
    ElMessage.success('封禁成功')

    // 修改fetchData调用方式，传入保存的缓存
    await fetchData(cachedUserNames)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleUnban = async (articleId: number) => {
  try {
    // 保存当前缓存的用户名映射
    const cachedUserNames = { ...userNameCache };

    await unbanArticle(articleId)
    ElMessage.success('解封成功')

    // 修改fetchData调用方式，传入保存的缓存
    await fetchData(cachedUserNames)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleIgnoreReport = async (row: any) => {
  try {
    // 保存当前缓存的用户名映射
    const cachedUserNames = { ...userNameCache };

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
      // 从举报列表中移除该文章
      reportedArticles.value = reportedArticles.value.filter(
        article => article.report_id !== row.report_id
      );
    } else {
      throw new Error(res.data?.msg || '忽略举报失败');
    }

    // 重新获取数据时传入用户名缓存
    await fetchData(cachedUserNames);
  } catch (error: any) {
    console.error('忽略举报失败:', error);
    ElMessage.error(`操作失败: ${error.message || '未知错误'}`);
  }
}
</script>

<style scoped>
.articles-container {
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

/* 文章详情遮罩层 */
.article-detail-overlay {
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