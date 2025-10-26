<template>
  <div class="books-container">
    <h2>书籍管理</h2>
    <DataList :pending-data="bookList" :reported-data="reportedBooks" :normal-data="bannedBooks"
      @row-click="handleRowClick" default-active-tab="pending" :show-pending="true" content-type="book">
      <template #default="{ row, activeTab }">
        <el-table-column prop="book_id" label="ID" width="80" />
        <el-table-column prop="book_title" label="书名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="book_writer" label="作者" min-width="120" show-overflow-tooltip />
        <el-table-column prop="book_type" label="类型" min-width="100" />
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
        <!-- 只在被举报页面显示举报次数和原因 -->
        <template v-if="activeTab === 'reported'">
          <el-table-column prop="report_count" label="举报次数" width="100" />
          <el-table-column label="举报原因" min-width="150" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope.row.report_reason">{{ scope.row.report_reason }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </template>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <!-- a. 被举报书籍 -->
            <template v-if="scope.row.is_reported && !scope.row.is_banned">
              <el-button size="small" type="success" @click.stop="handleIgnoreReport(scope.row)">
                忽略
              </el-button>
              <el-button size="small" type="danger" @click.stop="handleBan(scope.row.book_id)">
                封禁
              </el-button>
            </template>
            <!-- b. 待审核但未被举报书籍 -->
            <template v-else-if="!scope.row.is_banned && !scope.row.is_reported">
              <el-button size="small" type="success" @click.stop="handleApprove(scope.row.book_id)">
                通过
              </el-button>
              <el-button size="small" type="danger" @click.stop="handleBan(scope.row.book_id)">
                封禁
              </el-button>
            </template>
            <!-- c. 已封禁书籍 -->
            <template v-else>
              <el-button size="small" type="primary" @click.stop="handleUnban(scope.row.book_id)">
                解封
              </el-button>
            </template>
          </template>
        </el-table-column>
      </template>
    </DataList>

    <!-- 书籍详情弹窗 -->
    <transition name="fade">
      <div v-if="selectedBook" class="book-detail-overlay" @click.self="closeBookDetail">
        <book-detail :book="selectedBook" @close="closeBookDetail" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import DataList from '../components/DataList.vue'
import BookDetail from '../components/book_detail/book_detail.vue'
import { useBooksStore } from '@/store/books'
import { ElMessage } from 'element-plus'
import type { Book } from '@/types/book'
import reportApi from '@/api/modules/reportApi'
import { booksApi } from '@/api/modules/booksApi'

// 定义举报对象的接口
interface Report {
  report_id: number
  report_content_id: number
  report_reason: string
  reporter_id?: number
}

const booksStore = useBooksStore()
const { bookList, bannedBooks } = storeToRefs(booksStore)
const { getBooks, setBookReviewed, setBookReviewedAndBanned, unbanBook } = booksStore

const reportedBooks = ref<any[]>([])
const selectedBook = ref<Book | null>(null)

const handleRowClick = (row: Book) => {
  selectedBook.value = row
}

const closeBookDetail = () => {
  selectedBook.value = null
}

const fetchData = async () => {
  try {
    await getBooks({ status: 'pending' })
    await getBooks({ status: 'banned' })

    // 获取被举报书籍
    try {
      const reportedRes = await reportApi.getReportsByBookType()
      console.log('书籍举报数据 API 返回:', reportedRes)

      // 检查是否有数据
      if (reportedRes.data && reportedRes.data.data) {
        const reports = reportedRes.data.data as Report[]

        // 检查报告内容
        console.log('报告内容样例:', reports.length > 0 ? reports[0] : '无数据')

        // 获取被举报书籍的详细信息
        const reportedBooksDetails: any[] = [];

        // 按照书籍ID对举报进行分组
        const reportGroups: Record<number, Report[]> = {};

        // 将报告按内容ID分组
        reports.forEach(report => {
          if (!report.report_content_id) return;

          // 如果该内容ID已被封禁，跳过
          if (bannedBooks.value.some(banned => banned.book_id === report.report_content_id)) {
            return;
          }

          if (!reportGroups[report.report_content_id]) {
            reportGroups[report.report_content_id] = [];
          }
          reportGroups[report.report_content_id].push(report);
        });

        console.log('分组后的举报:', reportGroups);

        // 对每个唯一的book_id获取详情
        for (const bookId in reportGroups) {
          const numericBookId = Number(bookId);
          const bookReports = reportGroups[numericBookId];

          try {
            // 使用booksApi获取书籍详情
            const bookRes = await booksApi.getBookById(numericBookId);
            console.log(`书籍ID=${numericBookId}的详情:`, bookRes);

            if (bookRes.data && bookRes.data.code === 1 && bookRes.data.data) {
              const bookDetail = bookRes.data.data;

              // 合并举报原因
              const uniqueReasons = new Set<string>();
              bookReports.forEach(report => {
                if (report.report_reason) uniqueReasons.add(report.report_reason);
              });

              // 创建合并后的举报原因
              const mergedReasons = Array.from(uniqueReasons).join('; ');

              // 创建包含聚合举报信息的书籍条目
              reportedBooksDetails.push({
                ...bookDetail,
                is_reported: true,
                report_reason: mergedReasons,
                report_count: bookReports.length,
                report_id: bookReports[0].report_id, // 保留第一个举报ID用于操作
                reporter_id: bookReports[0].reporter_id
              });
            }
          } catch (error) {
            console.error(`获取书籍ID=${numericBookId}详情失败:`, error);
          }
        }

        reportedBooks.value = reportedBooksDetails;
        console.log('处理后的被举报书籍:', reportedBooks.value)
      } else {
        reportedBooks.value = []
        console.log('没有书籍举报数据')
      }
    } catch (error) {
      console.error('获取举报数据失败:', error)
      reportedBooks.value = []
    }

  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取书籍失败')
  }
}

onMounted(fetchData)

const handleApprove = async (bookId: number) => {
  try {
    await setBookReviewed(bookId)
    ElMessage.success('审核通过成功')
    await fetchData()
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleBan = async (bookId: number) => {
  try {
    await setBookReviewedAndBanned(bookId)
    ElMessage.success('封禁成功')
    await fetchData()
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleUnban = async (bookId: number) => {
  try {
    await unbanBook(bookId)
    ElMessage.success('解封成功')
    await fetchData()
  } catch {
    ElMessage.error('操作失败')
  }
}

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
      // 从举报列表中移除该书籍
      reportedBooks.value = reportedBooks.value.filter(
        book => book.report_id !== row.report_id
      );
    } else {
      throw new Error(res.data?.msg || '忽略举报失败');
    }
  } catch (error: any) {
    console.error('忽略举报失败:', error);
    ElMessage.error(`操作失败: ${error.message || '未知错误'}`);
  }
}
</script>

<style scoped>
.books-container {
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

/* 书籍详情遮罩层 */
.book-detail-overlay {
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
