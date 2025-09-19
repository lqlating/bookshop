<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
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

// 显示的书籍数量
const displayedCount = ref(12);
const isLoadingMore = ref(false);

// 书籍列表容器引用
const bookListContainer = ref(null);

// 预加载卖家信息的缓存
const sellerInfoCache = new Map();

// 获取卖家信息（带缓存）
async function fetchSellerInfo(sellerId) {
  if (sellerInfoCache.has(sellerId)) {
    return sellerInfoCache.get(sellerId);
  }

  try {
    const res = await sellerApi.getSellerById(sellerId);
    const sellerInfo = res.data.data;
    sellerInfoCache.set(sellerId, sellerInfo);
    return sellerInfo;
  } catch (error) {
    console.error('获取卖家信息失败:', error);
    return null;
  }
}

// 打开书籍详情
const openBookDetail = async (book) => {
  console.log('点击了书籍，当前登录状态:', isLogin.value);
  if (!isLogin.value) {
    console.log('用户未登录，尝试显示登录框');
    userStore.showLogin = true;
    console.log('设置后的 showLogin 值:', userStore.showLogin);
    return;
  }

  // 创建初始加载状态
  const loadingState = {
    image: `data:image/jpeg;base64,${book.book_img}`,
    title: book.book_title,
    author: book.book_writer,
    price: book.book_price,
    description: book.book_descripe,
    seller_id: book.book_seller_id,
    book_id: book.book_id,
    sellerInfo: null,
    isLoading: true
  };

  selectedBook.value = loadingState;

  try {
    // 预加载卖家信息
    const sellerInfo = await fetchSellerInfo(book.book_seller_id);
    selectedBook.value.sellerInfo = sellerInfo;
  } catch (error) {
    console.error('获取卖家信息失败:', error);
    selectedBook.value.sellerInfo = null;
  } finally {
    // 完成加载
    selectedBook.value.isLoading = false;
  }
};

// 关闭书籍详情
const closeBookDetail = () => {
  selectedBook.value = null;
};
</script>

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
    <div class="book-list-container" ref="bookListContainer">
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 骨架屏加载效果 -->
      <div v-if="isLoading && displayedBooks.length === 0" class="book-list-masonry">
        <div v-for="n in 8" :key="n" class="book-item skeleton-item">
          <div class="skeleton-image"></div>
          <div class="skeleton-info">
            <div class="skeleton-line title-line"></div>
            <div class="skeleton-line author-line"></div>
            <div class="skeleton-line price-line"></div>
          </div>
        </div>
      </div>

      <!-- 书籍列表 -->
      <transition-group v-else name="fade-masonry" tag="div" class="book-list-masonry">
        <div v-for="book in displayedBooks" :key="book.book_id" class="book-item" @click="openBookDetail(book)">
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
      
      <!-- 加载更多提示 -->
      <div v-if="isLoadingMore" class="loading-more">加载中...</div>
      <div v-else-if="hasMoreBooks" class="load-more-tip">滚动加载更多</div>
      <div v-else-if="displayedBooks.length > 0 && !hasMoreBooks" class="no-more-data">没有更多数据了</div>
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