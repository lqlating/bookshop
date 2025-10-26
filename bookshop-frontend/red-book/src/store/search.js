import { defineStore } from 'pinia';
import { ref } from 'vue';
import searchApi from '../api/searchApi';
import { articleStore } from './article';
import { bookStore } from './books';

export const searchStore = defineStore('search', () => {
  // 获取 articleStore 实例
  const articles = articleStore();
  let searchArticle = ref(true);
  let isSearch = ref(false);
  // 使用 articleStore 中的 articleLists
  let articleLists = articles.articleLists;
  // 添加搜索关键词
  const searchKeyword = ref('');

  // 用于存储搜索的用户列表
  const userList = ref([]);

  // 根据标题或内容搜索文章
  async function searchArticleByTitleOrContent(keyword) {
    try {
      // 在搜索前清空 articleLists
      articleLists.splice(0, articleLists.length); // 清空 articleLists
      searchKeyword.value = keyword; // 更新搜索关键词

      const res = await searchApi.searchArticle(keyword);
      // 如果搜索结果不为空，更新 articleLists
      if (res.data.data && res.data.data.length > 0) {
        Object.assign(articleLists, res.data.data);
      }
    } catch (error) {
      console.error('Error searching articles:', error);
      // 如果发生错误，仍然确保清空 articleLists
      articleLists.splice(0, articleLists.length);
    }
  }

  // 根据用户名搜索用户
  async function searchUserByUsername(username) {
    try {
      // 在搜索前清空 userList
      userList.value.splice(0, userList.value.length); // 清空 userList
      searchKeyword.value = username; // 更新搜索关键词

      const res = await searchApi.searchUserByUsername(username);
      // 如果搜索结果不为空，更新 userList
      if (res.data.data && res.data.data.length > 0) {
        Object.assign(userList.value, res.data.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      // 如果发生错误，仍然确保清空 userList
      userList.value.splice(0, userList.value.length);
    }
  }

  // 获取指定标题或内容的文章
  function getArticleByTitleOrContent(keyword) {
    return articleLists.find(article => article.title.includes(keyword) || article.content.includes(keyword)) || null;
  }

  // 获取指定用户名的用户
  function getUserByUsername(username) {
    return userList.value.find(user => user.username === username) || null;
  }

  // 重置搜索状态和结果
  function resetSearch() {
    isSearch.value = false;
    searchArticle.value = true;
    searchKeyword.value = ''; // 清空搜索关键词
    articleLists.splice(0, articleLists.length);
    userList.value.splice(0, userList.value.length);
  }

  // 根据书名搜索书籍
  async function searchBooksByTitle(title) {
    try {
      searchKeyword.value = title; // 更新搜索关键词
      const books = bookStore();

      const res = await searchApi.searchBooksByTitle(title);
      // 如果搜索结果不为空，更新书籍列表
      if (res.data.data && res.data.data.length > 0) {
        // 清空现有列表并添加新数据
        books.bookLists.splice(0, books.bookLists.length);
        Object.assign(books.bookLists, res.data.data);
      }
    } catch (error) {
      console.error('Error searching books:', error);
      // 发生错误时不清空列表，保持现有数据
    }
  }

  return {
    isSearch,
    articleLists, // 共享的 articleLists
    userList,
    searchArticle,
    searchKeyword, // 导出搜索关键词
    searchArticleByTitleOrContent,
    searchUserByUsername,
    getArticleByTitleOrContent,
    getUserByUsername,
    resetSearch, // 重置方法
    searchBooksByTitle, // 搜索书籍方法
  };
});