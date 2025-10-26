<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import { articleStore } from '../../store/article';
import { commentInfoStore } from '../../store/comment';
import { searchStore } from '../../store/search';
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next';
import 'vue-waterfall-plugin-next/dist/style.css';
import ArticleInner from '../subArticle/article_inner.vue';
import Like_button from '../subArticle/like_button.vue';
import { storeToRefs } from 'pinia';
import UserList from './UserList.vue';
import { titleStore } from '../../store/title';
import { userInfoStore } from '../../store/user';
import { useRoute } from 'vue-router';

// 获取路由
const route = useRoute();

// 获取用户信息
const userStore = userInfoStore();
const { isLogin, userThing } = storeToRefs(userStore);

// 获取文章数据，使用storeToRefs确保响应性
const articleStoreInstance = articleStore();
const { 
  articleLists, 
  filteredArticles, 
  hasMoreData, 
  isLoading: storeLoading,
  currentCategory,
  currentSearchKeyword,
  isSearchMode
} = storeToRefs(articleStoreInstance);
const { 
  filterContent, 
  filterContentExcludeAuthor, 
  searchArticle: searchArticleAction, 
  searchArticleExcludeAuthor,
  loadMoreArticles,
  setCurrentCategory,
  setCurrentSearchKeyword,
  resetPagination
} = articleStoreInstance;

// 获取评论数据
const commentStore = commentInfoStore();
const { getCommentCount, getComments } = commentStore;

// 获取搜索数据
const searchStoreInstance = searchStore();
const { isSearch, searchArticle, searchKeyword } = storeToRefs(searchStoreInstance);

// 本地状态
const selectedArticle = ref(null);
const imageLoaded = ref({});
const isInitialLoad = ref(true); // 用于标记第一次加载
const currentTitleValue = ref('Romance'); // 当前激活的标题值，用于强制重新渲染
const mainBodyRef = ref(null);

// 标题数据
const titleStoreInstance = titleStore();
const { titleList } = storeToRefs(titleStoreInstance);
const { fetchAllTitles: fetchTitles } = titleStoreInstance;

// 搜索时使用的标题列表
const newTitleList = ref([
  { title: '文章', value: 'Articles', isActive: true },
  { title: '用户', value: 'Users', isActive: false }
]);

// Waterfall组件的断点设置
const breakpoints = ref({
  1200: { rowPerView: 5 },
  800: { rowPerView: 3 },
  500: { rowPerView: 2 }
});

// 计算要显示的文章列表
const displayArticles = computed(() => {
  // 如果是搜索状态，返回filteredArticles
  if (isSearch.value) {
    return filteredArticles.value;
  }

  // 非搜索状态，如果articleLists为空但filteredArticles有数据，则返回filteredArticles
  if (articleLists.value.length === 0 && filteredArticles.value.length > 0) {
    return filteredArticles.value;
  }

  // 否则返回articleLists
  return articleLists.value;
});

// 监听文章数据变化，只打印文章列表
watch(displayArticles, (newArticles) => {
  console.log(`文章列表 (${newArticles.length}篇):`, newArticles);
}, { immediate: true });

// 处理图片加载
function handleImageLoad(articleId) {
  imageLoaded.value[articleId] = true;
}

// 滚动监听，实现懒加载
const handleScroll = () => {
  if (!mainBodyRef.value) return;
  
  const scrollBottom = mainBodyRef.value.scrollTop + mainBodyRef.value.clientHeight;
  const scrollHeight = mainBodyRef.value.scrollHeight;
  const threshold = scrollHeight - 200; // 距离底部200px时开始加载
  
  if (scrollBottom >= threshold && hasMoreData.value && !storeLoading.value) {
    handleLoadMore();
  }
};

// 懒加载更多数据
const handleLoadMore = async () => {
  const result = await loadMoreArticles();
  if (result.success && result.articles) {
    // 新文章已经添加到store中，无需额外处理
    console.log(`加载了 ${result.articles.length} 篇新文章`);
  }
  return result;
};

// 文章选择处理
function selectArticle(item) {
  if (!isLogin.value) {
    userStore.showLogin = true;
    return;
  }

  if (selectedArticle.value === item) {
    selectedArticle.value = null;
  } else {
    selectedArticle.value = item;
    getCommentCount(item.article_id);
    getComments(item.article_id);
  }
}

// 关闭文章详情
function closeArticleInner() {
  selectedArticle.value = null;
}

// 设置激活的标题并加载相应文章
const setActive = async (item, value) => {
  // 更新当前标题值用于强制刷新瀑布流组件
  currentTitleValue.value = value;

  // 清空图片加载状态和数据
  imageLoaded.value = {};
  articleLists.value.length = 0;
  filteredArticles.value.length = 0;

  // 重置分页状态
  resetPagination();

  // 根据搜索状态确定行为
  if (isSearch.value) {
    if (value === 'Articles') {
      searchArticle.value = true;
      setCurrentSearchKeyword(searchKeyword.value);
      if (userThing.value && userThing.value.id) {
        await searchArticleExcludeAuthor(searchKeyword.value, userThing.value.id);
      }
    } else {
      searchArticle.value = false;
    }
  } else {
    // 设置当前分类
    setCurrentCategory(value);
    // 获取文章时排除当前用户的文章
    if (userThing.value && userThing.value.id) {
      await filterContentExcludeAuthor(value, userThing.value.id);
    } else {
      await filterContent(value);
    }
  }

  // 更新激活状态
  const listToUpdate = isSearch.value ? newTitleList.value : titleList.value;
  listToUpdate.forEach(title => {
    title.isActive = title.title === item.title;
  });
};

// 确保文章数据加载完成的函数
const ensureArticlesLoaded = async () => {
  // 根据搜索状态获取默认标题
  if (!isSearch.value) {
    // 在标题列表中找到 Romance 标题
    const defaultTitle = titleList.value.find(item => item.value === 'Romance');
    if (defaultTitle) {
      console.log('准备初次加载数据，默认标题:', defaultTitle);
      await setActive(defaultTitle, defaultTitle.value);

      // 检查articleLists是否为空，如果为空但filteredArticles有数据，则复制过来
      if (articleLists.value.length === 0 && filteredArticles.value.length > 0) {
        console.log('检测到articleLists为空但filteredArticles有数据, 进行同步');
        articleLists.value.push(...filteredArticles.value);
      }

      console.log('初次加载数据完成, articleLists:', articleLists.value);
      console.log('filteredArticles:', filteredArticles.value);
    }
  } else {
    const articlesItem = newTitleList.value.find(item => item.value === 'Articles');
    if (articlesItem) {
      await setActive(articlesItem, articlesItem.value);
    }
  }

  isInitialLoad.value = false;
};

// 监听搜索状态变化
watch(isSearch, (newValue) => {
  if (newValue) {
    const articlesItem = newTitleList.value.find(item => item.value === 'Articles');
    if (articlesItem) {
      setActive(articlesItem, articlesItem.value);
    }
  } else {
    const defaultTitle = titleList.value.find(item => item.value === 'Romance');
    if (defaultTitle) {
      setActive(defaultTitle, defaultTitle.value);
    }
  }
});

// 监听用户登录状态变化
watch(() => userThing.value.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    const currentActiveTitle = isSearch.value
      ? newTitleList.value.find(item => item.isActive)
      : titleList.value.find(item => item.isActive);

    if (currentActiveTitle) {
      setActive(currentActiveTitle, currentActiveTitle.value);
    }
  }
}, { deep: true });

// 监听路由变化
watch(() => route.path, (newPath) => {
  if (newPath === '/Discover' && !isSearch.value) {
    const defaultTitle = titleList.value.find(item => item.value === 'Romance');
    if (defaultTitle) {
      setActive(defaultTitle, defaultTitle.value);
    }
  }
});

// 监控标题列表变化
watch(titleList, async (newTitleList) => {
  if (newTitleList.length > 0 && isInitialLoad.value) {
    // 当标题列表首次加载完成后，再加载文章数据
    await ensureArticlesLoaded();
  }
}, { immediate: true });

// 组件挂载
onMounted(async () => {
  console.log("Discover组件挂载");

  // 获取所有标题
  await fetchTitles();

  // 确保在标题加载后再加载文章数据
  if (titleList.value.length > 0) {
    // 延迟一下，确保Vue内部已完成DOM更新
    setTimeout(async () => {
      await ensureArticlesLoaded();
    }, 100);
  }

  // 添加滚动监听
  if (mainBodyRef.value) {
    mainBodyRef.value.addEventListener('scroll', handleScroll);
  }
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  if (mainBodyRef.value) {
    mainBodyRef.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<template>
  <div class="Discover-wrapper">
    <div class="title">
      <span v-for="item in (isSearch ? newTitleList : titleList)" :key="item.title"
        :class="{ 'title-inner': true, 'active': item.isActive }" @click="setActive(item, item.value)">
        {{ item.title }}
      </span>
    </div>
    <transition name="fade">
      <div class="main-body" ref="mainBodyRef" @scroll="handleScroll">
        <!-- 文章列表区域，不再使用searchArticle条件判断，而是根据displayArticles长度和激活的标题类型判断显示内容 -->
        <template v-if="(isSearch && searchArticle) || !isSearch">
          <div v-if="displayArticles.length === 0 && !storeLoading" class="no-articles">
            没有相应文章
          </div>
          <Waterfall v-else :list="displayArticles" :key="currentTitleValue" :breakpoints="breakpoints" :gutter="25">
            <template #item="{ item }">
              <div class="card">
                <transition name="fade">
                  <LazyImg class="lazy" :url="`data:image/png;base64,${item.img_url}`"
                    @load="handleImageLoad(item.article_id)" :key="item.article_id + '-img'"
                    v-show="imageLoaded[item.article_id]" @click="selectArticle(item)" />
                </transition>
                <p class="text" @click="selectArticle(item)">{{ item.title }}</p>
                <Like_button :item="item" :key="item.article_id + '-like'" :out="true" />
              </div>
            </template>
          </Waterfall>
          
          <!-- 加载指示器 -->
          <div v-if="storeLoading" class="loading-indicator">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>
        </template>

        <!-- 如果搜索的是用户 -->
        <UserList v-else />
      </div>
    </transition>
    <ArticleInner v-if="selectedArticle" :article="selectedArticle" :article_inner="true" :close="closeArticleInner"
      :current-user-id="userThing.id" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.main-body::-webkit-scrollbar {
  width: 0;
}

.main-body {
  width: 100%;
  max-height: 75vh;
  overflow-y: auto;
  flex-wrap: wrap;
  justify-content: space-evenly;
}


.title {
  display: inline-flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title-inner {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 40px;
  border-radius: 20px;
  font-weight: normal;
  transition: font-weight 0.3s ease;
}

.active {
  background-color: #f0f0f0;
  font-weight: bold;
}

.lazy {
  border: 0.1px solid rgb(231, 227, 227);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.lazy:hover {
  transform: scale(1.05);
}

.lazy::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.lazy:hover::after {
  opacity: 1;
}

.text {
  color: #333333;
  font-size: 14px;
  padding: 0 10px;
  word-break: break-all;
  overflow: hidden;
}

/* 加载指示器样式 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-articles {
  margin: 200px;
  text-align: center;
  color: #888;
  font-size: 16px;
  padding: 20px;
}
</style>