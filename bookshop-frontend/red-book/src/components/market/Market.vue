<template>
  <div class="market-wrapper">
    <!-- 调试按钮 -->
    <button class="debug-toggle" @click="showDebug = !showDebug">
      {{ showDebug ? '隐藏调试' : '显示调试' }}
    </button>
    
    <!-- 导航栏 -->
    <div class="title" :class="{ 'invisible': isSearch }">
      <span v-for="item in titleList" :key="item.title" :class="{ 'title-inner': true, 'active': item.isActive }"
        @click="setActive(item, item.value)">
        {{ item.title }}
      </span>
    </div>

    <!-- 虚拟滚动网格布局 -->
    <div class="book-list-container">
      <VirtualGrid
        :items="bookLists"
        :column-count="getColumnCount()"
        :gap="20"
        :item-height="500"
        :buffer="5"
        :is-loading="isLoading || storeLoading"
        :has-more="hasMoreData"
        @load-more="handleLoadMoreBooks"
        @scroll="handleVirtualScroll"
        ref="virtualGridRef"
      >
        <template #default="{ item: book, index }">
          <div class="book-item" @click="openBookDetail(book)">
            <!-- 书籍图片 -->
            <img v-if="book.book_img" :src="`data:image/jpeg;base64,${book.book_img}`" alt="book cover"
              class="book-image" loading="lazy" />
            <div v-else class="book-image-placeholder">暂无图片</div>

            <!-- 书籍信息 -->
            <div class="book-info">
              <h3 class="book-title">{{ book.book_title }}</h3>
              <p class="book-author">{{ book.book_writer }}</p>
              <p class="book-price">￥{{ book.book_price }}</p>
            </div>
          </div>
        </template>
      </VirtualGrid>
    </div>

    <!-- 回顶部按钮 -->
    <transition name="back-to-top">
      <button 
        class="back-to-top" 
        v-show="showBackToTop" 
        @click="scrollToTop"
        :class="{ 'pulse': isScrolling }"
      >
        <div class="back-to-top-content">
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="back-to-top-ripple"></div>
      </button>
    </transition>

    <!-- 书籍详情页面 -->
    <transition name="fade">
      <div v-if="selectedBook" class="overlay" @click.self="closeBookDetail">
        <book-detail :book="selectedBook" @close="closeBookDetail" />
      </div>
    </transition>
    
    <!-- 虚拟滚动调试组件 -->
    <VirtualScrollDebug
      :total-items="bookLists.length"
      :column-count="getColumnCount()"
      :item-height="500"
      :gap="20"
      :buffer="5"
      :scroll-top="scrollData.scrollTop"
      :container-height="scrollData.containerHeight"
      :scroll-height="scrollData.scrollHeight"
      :visible-row-start="visibleRowStart"
      :visible-row-end="visibleRowEnd"
      :visible-items-count="visibleItemsCount"
      :offset-y="offsetY"
      :is-loading="isLoading || storeLoading"
      :has-more="hasMoreData"
      :show-debug="showDebug"
      @toggle-debug="showDebug = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { storeToRefs } from "pinia";
import BookDetail from "./book_detail/book_detail.vue";
import VirtualGrid from "./VirtualGrid.vue";
import VirtualScrollDebug from "./VirtualScrollDebug.vue";
import { titleStore } from "../../store/title";
import { bookStore } from "../../store/books";
import { searchStore } from "../../store/search";
import { userInfoStore } from "../../store/user";

// 选中的书籍
const selectedBook = ref(null);

// 使用 userStore
const userStore = userInfoStore();
const { isLogin, showLogin } = storeToRefs(userStore);

// 打开书籍详情
const openBookDetail = (book) => {
  console.log('点击了书籍，当前登录状态:', isLogin.value);
  if (!isLogin.value) {
    console.log('用户未登录，尝试显示登录框');
    userStore.showLogin = true;
    console.log('设置后的 showLogin 值:', userStore.showLogin);
    return;
  }
  selectedBook.value = {
    image: `data:image/jpeg;base64,${book.book_img}`,
    title: book.book_title,
    author: book.book_writer,
    price: book.book_price,
    description: book.book_descripe,
    seller_id: book.book_seller_id,
    book_id: book.book_id,
  };
};

// 关闭书籍详情
const closeBookDetail = () => {
  selectedBook.value = null;
};

// 使用 titleStore
const titleData = titleStore();
const { titleList, fetchAllTitles } = titleData;

// 使用 bookStore
const bookData = bookStore();
const { 
  fetchBooksByType, 
  loadMoreBooks, 
  setCurrentBookType, 
  setCurrentSearchKeyword, 
  resetPagination 
} = bookData;
const { 
  bookLists, 
  hasMoreData, 
  isLoading: storeLoading 
} = storeToRefs(bookData);

// 使用 searchStore
const searchStoreData = searchStore();
const { isSearch, searchKeyword } = storeToRefs(searchStoreData);

// 本地加载状态（用于兼容原有逻辑）
const isLoading = ref(false);
const virtualGridRef = ref(null);

// 调试相关
const showDebug = ref(false);
const scrollData = ref({
  scrollTop: 0,
  containerHeight: 0,
  scrollHeight: 0
});

// 虚拟滚动计算参数
const visibleRowStart = ref(0);
const visibleRowEnd = ref(0);
const visibleItemsCount = ref(0);
const offsetY = ref(0);

// 设置激活的分类并获取书籍数据
const setActive = async (item, value) => {
  // 设置激活的分类
  titleList.forEach((title) => {
    title.isActive = title.title === item.title;
  });

  // 重置分页状态
  resetPagination();
  
  // 设置当前书籍类型
  setCurrentBookType(value);

  // 显示加载指示器
  isLoading.value = true;

  // 获取书籍数据
  await fetchBooksByType(value);

  // 隐藏加载指示器
  isLoading.value = false;
};

// 监听滚动控制回到顶部按钮的显示
const showBackToTop = ref(false);
const isScrolling = ref(false);
let scrollTimer = null;

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300;
  
  // 滚动时的脉冲效果
  isScrolling.value = true;
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    isScrolling.value = false;
  }, 150);
};

// 获取响应式列数
const getColumnCount = () => {
  const width = window.innerWidth;
  if (width >= 1200) return 4;
  if (width >= 800) return 3;
  if (width >= 500) return 2;
  return 1;
};

// 虚拟滚动处理
const handleVirtualScroll = (scrollInfo) => {
  // 更新滚动数据
  scrollData.value = {
    scrollTop: scrollInfo.scrollTop,
    containerHeight: scrollInfo.clientHeight,
    scrollHeight: scrollInfo.scrollHeight
  };
  
  // 计算可见范围
  const columnCount = getColumnCount();
  const itemHeight = 500;
  const gap = 20;
  const buffer = 5;
  const rowHeight = itemHeight + gap;
  
  const start = Math.max(0, Math.floor(scrollInfo.scrollTop / rowHeight) - buffer);
  const end = Math.min(
    Math.ceil(bookLists.value.length / columnCount) - 1,
    Math.ceil((scrollInfo.scrollTop + scrollInfo.clientHeight) / rowHeight) + buffer
  );
  
  visibleRowStart.value = start;
  visibleRowEnd.value = end;
  visibleItemsCount.value = Math.min((end - start + 1) * columnCount, bookLists.value.length);
  offsetY.value = start * rowHeight;
  
  // 更新回顶部按钮显示状态
  showBackToTop.value = scrollInfo.scrollTop > 300;
  
  // 滚动时的脉冲效果
  isScrolling.value = true;
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    isScrolling.value = false;
  }, 150);
  
  // 防止滑到底部后继续滑动
  if (!hasMoreData.value && scrollInfo.scrollTop + scrollInfo.clientHeight >= scrollInfo.scrollHeight - 10) {
    // 如果已经到底部且没有更多数据，阻止继续滚动
    if (virtualGridRef.value && virtualGridRef.value.containerRef) {
      const container = virtualGridRef.value.containerRef
      const maxScrollTop = scrollInfo.scrollHeight - scrollInfo.clientHeight
      if (container.scrollTop > maxScrollTop) {
        container.scrollTop = maxScrollTop
      }
    }
  }
};

// 懒加载更多书籍
const handleLoadMoreBooks = async () => {
  const result = await loadMoreBooks();
  if (result.success && result.books) {
    console.log(`加载了 ${result.books.length} 本新书籍`);
  }
  return result;
};

// 回到顶部
const scrollToTop = () => {
  if (virtualGridRef.value) {
    virtualGridRef.value.scrollToTop();
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// 绑定和解绑滚动监听
onMounted(async () => {
  await fetchAllTitles();
  // 默认加载第一个分类的书籍
  if (titleList.length > 0) {
    await setActive(titleList[0], titleList[0].value);
  }
  console.log(bookLists.value);

  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// 监听搜索状态变化
watch(isSearch, async (newValue) => {
  if (!newValue) {
    // 退出搜索模式，激活默认标签
    if (titleList && titleList.value && Array.isArray(titleList.value)) {
      const defaultTitle = titleList.value.find(item => item.value === '小说');
      if (defaultTitle) {
        setActive(defaultTitle, defaultTitle.value);
      }
    }
  } else {
    // 进入搜索模式，设置搜索关键词
    setCurrentSearchKeyword(searchKeyword.value);
  }
});
</script>

<style scoped>
.market-wrapper {
  width: 100%;
}

/* 导航栏样式 */
.title {
  display: inline-flex;
  justify-content: space-between;
  margin-bottom: 20px;
  transition: opacity 0.3s ease;
  /* 添加过渡效果 */
}

/* 添加不可见状态的样式 */
.invisible {
  opacity: 0;
  pointer-events: none;
  /* 防止点击不可见的导航栏 */
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

.title-inner.active {
  background-color: #f0f0f0;
  font-weight: bold;
}

/* 书籍列表容器 */
.book-list-container {
  height: calc(100vh - 170px);
  /* 改为视口高度减去顶部导航和边距的高度 */
  position: relative;
}

/* 书籍项样式 */
.book-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-item:hover {
  transform: translateY(-5px);
}

/* 书籍图片 */
.book-image {
  width: 100%;
  height: 380px;
  object-fit: cover;
  display: block;
}

.book-image-placeholder {
  width: 100%;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #888;
  font-size: 14px;
}

/* 书籍信息 */
.book-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-price {
  font-size: 16px;
  color: #e74c3c;
  font-weight: bold;
  margin: 0;
  margin-top: auto;
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 45px;
  height: 45px;
  background: rgba(102, 126, 234, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 1000;
}

.back-to-top:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: rgba(102, 126, 234, 0.8);
  border-color: rgba(255, 255, 255, 0.3);
}

.back-to-top:active {
  transform: translateY(-1px) scale(0.98);
}

.back-to-top.pulse {
  animation: pulse 0.6s ease-in-out;
}

.back-to-top-content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.arrow-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.back-to-top:hover .arrow-icon {
  transform: translateY(-1px);
}

.back-to-top-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.back-to-top:active .back-to-top-ripple {
  width: 100px;
  height: 100px;
}

/* 回顶部按钮进入/离开动画 */
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* 脉冲动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 遮罩层 */
.overlay {
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

/* 调试按钮样式 */
.debug-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}

.debug-toggle:hover {
  background: #1976D2;
}
</style>