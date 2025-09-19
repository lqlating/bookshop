import { defineStore } from 'pinia';
import { ref } from 'vue';
import bookApi from '../api/bookApi';

// 创建一个简单的缓存对象
const bookCache = new Map();
const CACHE_EXPIRATION = 5 * 60 * 1000; // 缓存5分钟

export const bookStore = defineStore('book', () => {
  // 书籍列表
  const bookLists = ref([]);
  // 卖家(用户)发布的书籍列表
  const sellerBooks = ref([]);

  // 获取所有书籍列表
  async function fetchBooks() {
    try {
      const res = await bookApi.listBooks();
      bookLists.value = res.data.data;
    } catch (error) {
      console.error("获取书籍列表失败:", error);
    }
  }

  // 根据书籍 ID 获取单本书籍
  async function fetchBookById(bookId) {
    try {
      const res = await bookApi.getBookById(bookId);
      return res.data.data;
    } catch (error) {
      console.error(`获取书籍 ${bookId} 失败:`, error);
      return null;
    }
  }

  // 获取特定卖家(用户)发布的所有书籍
  async function fetchBooksBySellerId(sellerId) {
    try {
      const res = await bookApi.getBooksBySellerId(sellerId);
      // 检查响应的 code 是否为成功状态，并且 data 是否为数组
      if (res.data && res.data.code === 1 && Array.isArray(res.data.data)) {
        sellerBooks.value = res.data.data;
        console.log("获取到卖家书籍:", sellerBooks.value);
      } else {
        console.warn("获取卖家书籍响应格式不正确:", res.data);
        sellerBooks.value = [];
      }
      return sellerBooks.value;
    } catch (error) {
      console.error(`获取卖家 ${sellerId} 的书籍失败:`, error);
      sellerBooks.value = [];
      return [];
    }
  }

  // 添加书籍
  async function addBook(book) {
    try {
      await bookApi.addBook(book);
      // 清除缓存
      bookCache.clear();
      fetchBooks(); // 重新获取书籍列表
    } catch (error) {
      console.error("添加书籍失败:", error);
    }
  }

  // 更新书籍信息
  async function updateBook(book) {
    try {
      await bookApi.updateBook(book);
      // 清除缓存
      bookCache.clear();
      fetchBooks(); // 重新获取书籍列表
    } catch (error) {
      console.error("更新书籍失败:", error);
    }
  }

  // 删除书籍
  async function deleteBook(bookId) {
    try {
      await bookApi.deleteBook(bookId);
      // 清除缓存
      bookCache.clear();
      fetchBooks(); // 重新获取书籍列表
    } catch (error) {
      console.error("删除书籍失败:", error);
    }
  }

  // 根据书籍类型获取书籍列表
  async function fetchBooksByType(bookType) {
    const cacheKey = `type_${bookType}`;
    
    // 检查缓存是否存在且未过期
    if (bookCache.has(cacheKey)) {
      const cachedData = bookCache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
        // 使用缓存数据
        bookLists.value = cachedData.data;
        return;
      } else {
        // 缓存过期，删除旧缓存
        bookCache.delete(cacheKey);
      }
    }

    try {
      const res = await bookApi.getBooksByType(bookType);
      bookLists.value = res.data.data;
      
      // 将数据存入缓存
      bookCache.set(cacheKey, {
        data: [...bookLists.value],
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`获取类型 ${bookType} 书籍失败:`, error);
    }
  }

  // 根据书名精确搜索书籍
  async function searchBooksByExactTitle(title) {
    try {
      const res = await bookApi.getBooksByExactTitle(title);
      if (res.data.data) {
        bookLists.value = res.data.data;
      }
    } catch (error) {
      console.error('精确搜索书籍失败:', error);
    }
  }

  // 根据书名模糊搜索书籍
  async function searchBooksByTitleContaining(title) {
    try {
      const res = await bookApi.getBooksByTitleContaining(title);
      if (res.data.data) {
        bookLists.value = res.data.data;
      }
    } catch (error) {
      console.error('模糊搜索书籍失败:', error);
    }
  }

  return {
    bookLists,
    sellerBooks,
    fetchBooks,
    fetchBookById,
    fetchBooksBySellerId,
    addBook,
    updateBook,
    deleteBook,
    fetchBooksByType,
    searchBooksByExactTitle,
    searchBooksByTitleContaining,
  };
});