<template>
  <div class="data-list">
    <!-- 搜索框 -->
    <div class="search-container">
      <el-input v-model="searchQuery" :placeholder="getSearchPlaceholder()" class="search-input" clearable
        @clear="handleSearch" size="default">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane v-if="showPending" label="待审核" name="pending">
        <el-table :data="filteredPendingData" border style="width: 100%" @row-click="handleRowClick">
          <slot name="default" :row="{}" :activeTab="activeTab"></slot>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="被举报" name="reported">
        <el-table :data="filteredReportedData" border style="width: 100%" @row-click="handleRowClick">
          <slot name="default" :row="{}" :activeTab="activeTab"></slot>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="已封禁" name="banned">
        <el-table :data="filteredNormalData" border style="width: 100%" @row-click="handleRowClick">
          <slot name="default" :row="{}" :activeTab="activeTab"></slot>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, withDefaults, computed, inject } from 'vue'
import { Search } from '@element-plus/icons-vue'

interface Props<T = any> {
  pendingData: T[]
  reportedData: T[]
  normalData: T[]
  showPending?: boolean
  defaultActiveTab?: string
  contentType?: 'article' | 'book' | 'comment' | 'user' // 内容类型
}

const props = withDefaults(defineProps<Props>(), {
  showPending: true,
  defaultActiveTab: 'pending',
  contentType: undefined
})

const emit = defineEmits(['row-click'])

const activeTab = ref(props.defaultActiveTab)
const searchQuery = ref('')

const handleRowClick = (row: any) => {
  emit('row-click', row)
}

// 根据不同内容类型获取搜索提示文本
const getSearchPlaceholder = () => {
  switch (props.contentType) {
    case 'article':
      return '搜索标题、作者或内容';
    case 'book':
      return '搜索书名、作者或类型';
    case 'comment':
      return '搜索评论内容或用户';
    case 'user':
      return '搜索用户ID或用户名';
    default:
      return '搜索内容或举报原因';
  }
}

// 针对文章的过滤
const filterArticles = (data: any[]) => {
  if (!searchQuery.value.trim()) return data;

  const query = searchQuery.value.toLowerCase();
  return data.filter(article => {
    // 文章标题
    if (article.title?.toLowerCase().includes(query)) return true;
    // 文章内容
    if (article.content?.toLowerCase().includes(query)) return true;
    // 作者名/用户名
    if (article.author_name?.toLowerCase().includes(query)) return true;
    if (article.username?.toLowerCase().includes(query)) return true;
    // 举报原因
    if (article.report_reason?.toLowerCase().includes(query)) return true;

    return false;
  });
}

// 针对书籍的过滤
const filterBooks = (data: any[]) => {
  if (!searchQuery.value.trim()) return data;

  const query = searchQuery.value.toLowerCase();
  return data.filter(book => {
    // 书名
    if (book.book_title?.toLowerCase().includes(query)) return true;
    // 作者
    if (book.book_writer?.toLowerCase().includes(query)) return true;
    // 类型
    if (book.book_type?.toLowerCase().includes(query)) return true;
    // 举报原因
    if (book.report_reason?.toLowerCase().includes(query)) return true;

    return false;
  });
}

// 针对评论的过滤
const filterComments = (data: any[]) => {
  if (!searchQuery.value.trim()) return data;

  const query = searchQuery.value.toLowerCase();
  return data.filter(comment => {
    // 评论内容
    if (comment.content?.toLowerCase().includes(query)) return true;
    // 用户名
    if (comment.user_name?.toLowerCase().includes(query)) return true;
    // 评论类型
    if (comment.target_type?.toLowerCase().includes(query)) return true;
    // 举报原因
    if (comment.report_reason?.toLowerCase().includes(query)) return true;

    return false;
  });
}

// 针对用户的过滤
const filterUsers = (data: any[]) => {
  if (!searchQuery.value.trim()) return data;

  const query = searchQuery.value.toLowerCase();
  return data.filter(user => {
    // 用户ID
    if (String(user.user_id).includes(query)) return true;
    // 用户名
    if (user.username?.toLowerCase().includes(query)) return true;
    // 举报原因
    if (user.report_reason?.toLowerCase().includes(query)) return true;

    return false;
  });
}

// 通用过滤函数
const filterData = (data: any[]) => {
  // 根据内容类型使用特定的过滤方法
  switch (props.contentType) {
    case 'article':
      return filterArticles(data);
    case 'book':
      return filterBooks(data);
    case 'comment':
      return filterComments(data);
    case 'user':
      return filterUsers(data);
    default:
      // 通用过滤，搜索所有文本字段
      if (!searchQuery.value.trim()) return data;

      const query = searchQuery.value.toLowerCase();
      return data.filter(item => {
        for (const key in item) {
          if (
            item[key] !== null &&
            item[key] !== undefined &&
            (typeof item[key] === 'string' || typeof item[key] === 'number')
          ) {
            const value = String(item[key]).toLowerCase();
            if (value.includes(query)) {
              return true;
            }
          }
        }
        return false;
      });
  }
};

// 过滤后的数据
const filteredPendingData = computed(() => filterData(props.pendingData));
const filteredReportedData = computed(() => filterData(props.reportedData));
const filteredNormalData = computed(() => filterData(props.normalData));

// 搜索处理函数
const handleSearch = () => {
  console.log('搜索查询:', searchQuery.value);
};
</script>

<style scoped>
.data-list {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 5px 0;
}

.search-input {
  width: 40%;
  max-width: 400px;
}

:deep(.el-input-group__append) {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}

:deep(.el-input__inner) {
  height: 36px;
  font-size: 14px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-table) {
  margin-top: 20px;
}
</style>