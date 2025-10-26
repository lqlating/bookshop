<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { searchStore } from '../../store/search';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import bookApi from '../../api/bookApi';
import searchApi from '../../api/searchApi';
import { userInfoStore } from '../../store/user';
import { articleStore } from '../../store/article';

// 使用 searchStore
const useSearchStore = searchStore();
const { searchArticleByTitleOrContent, searchUserByUsername, resetSearch, searchBooksByTitle } = useSearchStore;
const { isSearch, searchArticle, searchKeyword } = storeToRefs(useSearchStore);

// 获取用户信息
const userStore = userInfoStore();
const { userThing } = storeToRefs(userStore);

// 获取文章store以使用排除用户ID的搜索功能
const articleData = articleStore();
const { searchArticleExcludeAuthor } = articleData;

// 获取当前路由
const route = useRoute();
const router = useRouter();

// 加载状态
const isLoading = ref(false);

// 计算属性：判断当前路由是否允许搜索
const searchEnabled = computed(() => {
  return route.path === '/Discover' || route.path === '/Market';
});

// 监听路由变化
watch(
  () => route.path,
  (newPath, oldPath) => {
    // 如果路由发生变化，重置搜索状态
    if (newPath !== oldPath) {
      clearSearch();
    }
  }
);

// 点击搜索按钮或按下回车时触发搜索
const handleSearch = async () => {
  if (!searchEnabled.value) return;

  if (searchKeyword.value.trim() !== '') {
    isSearch.value = true;
    isLoading.value = true;

    try {
      // 根据当前路由调用不同的搜索函数
      if (route.path === '/Market') {
        await searchBooksByTitle(searchKeyword.value);
      } else if (route.path === '/Discover') {
        searchArticle.value = true;

        // 如果用户已登录，使用排除当前用户ID的搜索方法
        if (userThing.value && userThing.value.id) {
          await searchArticleExcludeAuthor(searchKeyword.value, userThing.value.id);
        } else {
          // 未登录用户使用原来的搜索方法
          await searchArticleByTitleOrContent(searchKeyword.value);
        }

        // 用户搜索功能保持不变
        await searchUserByUsername(searchKeyword.value);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      isLoading.value = false;
    }
  }
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = '';
  resetSearch();
}

// 监听回车键
const onEnterPress = (event) => {
  if (event.key === 'Enter' && searchEnabled.value) {
    handleSearch();
  }
}

// 在挂载时根据路由设置搜索函数
onMounted(() => {
  // 初始化时清空搜索状态
  clearSearch();
});

</script>

<template>
  <div>
    <div class="search-box">
      <span class="brand-name">集知书店</span>
      <span class="input-wrapper" :class="{ 'disabled': !searchEnabled }">
        <input type="text" class="input-box" placeholder="Search..." v-model="searchKeyword" @keyup.enter="onEnterPress"
          :disabled="!searchEnabled">
        <div class="search-icon" @click="handleSearch" :class="{ 'disabled': !searchEnabled }">
          <img class="search-img" src="../../assets/img/search.png" alt="">
        </div>
        <!-- 添加清除按钮 -->
        <div v-if="searchKeyword && searchEnabled" class="clear-icon" @click="clearSearch">
          ×
        </div>
      </span>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Lobster&display=swap');

.search-box {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
}

.brand-name {
  font-family: 'ZCOOL KuaiLe', 'Lobster', cursive;
  font-size: 26px;
  font-weight: bold;
  color: #ff2e4d;
  margin-right: 20px;
  margin-left: 47px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}

.input-wrapper.disabled .input-box {
  background-color: #e9e9e9;
  color: #888;
  cursor: not-allowed;
}

.input-box {
  background-color: #f5f5f5;
  border: 1px solid black;
  width: 500px;
  padding: 12px 40px 12px 16px;
  border: none;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 16px;
}

.search-icon {
  position: absolute;
  top: 57%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
}

.search-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-icon {
  position: absolute;
  top: 50%;
  right: 40px;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  color: #888;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-icon:hover {
  color: #ff2e4d;
}

.search-img {
  height: 20px;
  width: 20px;
}
</style>