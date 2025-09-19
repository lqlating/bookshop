<template>
  <div class="market-wrapper">
    <!-- 导航栏 -->
    <div class="title" :class="{ 'invisible': isSearch }">
      <span v-for="item in titleList" :key="item.title" :class="{ 'title-inner': true, 'active': item.isActive }"
        @click="setActive(item, item.value)">
        {{ item.title }}
      </span>
    </div>

    <!-- 书籍列表（瀑布流布局） -->
    <div class="book-list-container">
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 书籍列表 -->
      <transition-group name="fade-masonry" tag="div" class="book-list-masonry">
        <div v-for="book in bookLists" :key="book.book_id" class="book-item" @click="openBookDetail(book)">
          <!-- 书籍图片 -->
          <img v-if="book.book_img" :src="`data:image/jpeg;base64,${book.book_img}`" alt="book cover"
            class="book-image" />
          <div v-else class="book-image-placeholder">暂无图片</div>

          <!-- 书籍信息 -->
          <div class="book-info">
            <h3 class="book-title">{{ book.book_title }}</h3>
            <p class="book-author">{{ book.book_writer }}</p>
            <p class="book-price">￥{{ book.book_price }}</p>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- 回顶部按钮 -->
    <button class="back-to-top" v-show="showBackToTop" @click="scrollToTop">
      <span class="arrow">▲</span>
    </button>

    <!-- 书籍详情页面 -->
    <transition name="fade">
      <div v-if="selectedBook" class="overlay" @click.self="closeBookDetail">
        <book-detail :book="selectedBook" @close="closeBookDetail" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { storeToRefs } from "pinia";
import BookDetail from "./book_detail/book_detail.vue";
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
const { fetchBooksByType } = bookData;
const { bookLists } = storeToRefs(bookData);

// 使用 searchStore
const searchStoreData = searchStore();
const { isSearch, searchKeyword } = storeToRefs(searchStoreData);

// 加载状态
const isLoading = ref(false);

// 设置激活的分类并获取书籍数据
const setActive = async (item, value) => {
  // 设置激活的分类
  titleList.forEach((title) => {
    title.isActive = title.title === item.title;
  });

  // 显示加载指示器
  isLoading.value = true;

  // 获取书籍数据
  await fetchBooksByType(value);

  // 隐藏加载指示器
  isLoading.value = false;
};

// 监听滚动控制回到顶部按钮的显示
const showBackToTop = ref(false);
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300;
};

// 回到顶部
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  max-height: calc(100vh - 170px);
  /* 改为视口高度减去顶部导航和边距的高度 */
  overflow-y: auto;
  position: relative;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0));
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0));
}

/* 隐藏滚动条 */
.book-list-container::-webkit-scrollbar {
  width: 0;
  display: none;
}

/* 瀑布流布局 */
.book-list-masonry {
  column-gap: 20px;
  padding: 20px 20px 40px 20px;
  /* 增加底部padding，避免最后一行被渐变遮住 */
}

/* 大屏幕：4 列 */
@media (min-width: 1200px) {
  .book-list-masonry {
    column-count: 4;
  }
}

/* 中等屏幕：3 列 */
@media (min-width: 800px) and (max-width: 1199px) {
  .book-list-masonry {
    column-count: 3;
  }
}

/* 小屏幕：2 列 */
@media (min-width: 500px) and (max-width: 799px) {
  .book-list-masonry {
    column-count: 2;
  }
}

/* 超小屏幕：1 列 */
@media (max-width: 499px) {
  .book-list-masonry {
    column-count: 1;
  }
}

/* 书籍项样式 */
.book-item {
  break-inside: avoid;
  /* 防止内容被分割 */
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
  margin-bottom: 20px;
  /* 书籍项之间的间距 */
}

.book-item:hover {
  transform: translateY(-5px);
}

/* 书籍图片 */
.book-image {
  width: 100%;
  height: auto;
  display: block;
}

.book-image-placeholder {
  width: 100%;
  height: 200px;
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
}

.book-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px;
}

.book-author {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px;
}

.book-price {
  font-size: 16px;
  color: #e74c3c;
  font-weight: bold;
  margin: 0;
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: rgba(128, 128, 128, 0.7);
  /* 半透明灰色 */
  color: #fff;
  font-size: 20px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: opacity 0.3s, transform 0.3s;
}

.back-to-top:hover {
  background: rgba(128, 128, 128, 0.9);
  /* 悬停时加深颜色 */
}

.back-to-top:active {
  transform: scale(0.9);
}

.arrow {
  font-size: 24px;
  transform: translateY(-2px);
  /* 调整箭头位置 */
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

/* 书籍列表过渡效果 */
.fade-masonry-enter-active,
.fade-masonry-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-masonry-enter-from,
.fade-masonry-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-masonry-leave-active {
  position: absolute;
  /* 确保离开的元素不会影响布局 */
}

/* 加载指示器样式 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-indicator p {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}
</style>