// src/stores/likeStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import likeStarApi from '../api/likeStarApi';
import articleApi from '../api/articleApi'; // 引入 articleApi

export const useLikeStore = defineStore('like', () => {
  let likedArticleIds = ref([]);  // 用户点赞的文章ID列表
  let starredArticleIds = ref([]); // 用户收藏的文章ID列表
  let likedCommentIds = ref([]);   // 用户点赞的评论ID列表
  let articlesByAuthor = ref([]);  // 存储根据作者 ID 获取的文章

  // 获取用户点赞的文章ID列表
  const fetchLikedArticleIds = async (userId) => {
    try {
      const response = await likeStarApi.searchOperation(userId, 'article', 'like');
      if (response.data.code === 1) {
        likedArticleIds.value = response.data.data.map(item => item.target_id);
      }
    } catch (error) {
      console.error('获取点赞文章数据失败:', error);
    }
  };

  // 获取用户收藏的文章ID列表
  const fetchStarredArticleIds = async (userId) => {
    try {
      const response = await likeStarApi.searchOperation(userId, 'article', 'star');
      if (response.data.code === 1) {
        starredArticleIds.value = response.data.data.map(item => item.target_id);
      }
    } catch (error) {
      console.error('获取收藏数据失败:', error);
    }
  };

  // 获取用户点赞的评论ID列表
  const fetchLikedCommentIds = async (userId) => {
    try {
      const response = await likeStarApi.searchOperation(userId, 'comment', 'like');
      if (response.data.code === 1) {
        likedCommentIds.value = response.data.data.map(item => item.target_id);
      }
    } catch (error) {
      console.error('获取点赞评论数据失败:', error);
    }
  };

  // 根据作者ID获取文章列表
  const fetchArticlesByAuthorId = async (authorId) => {
    try {
      const response = await articleApi.getArticlesByAuthorId(authorId);
      if (response.data.code === 1) {
        articlesByAuthor.value = response.data.data; // 将返回的文章数据存储到 articlesByAuthor 中
      }
    } catch (error) {
      console.error('获取作者文章失败:', error);
    }
  };

  // 添加点赞文章
  const addLike = async (userId, articleId) => {
    try {
      const response = await likeStarApi.addOperation(userId, null, articleId, 'like');
      if (response.data.code === 1) {
        likedArticleIds.value.push(articleId);
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  // 删除点赞文章
  const removeLike = async (userId, articleId) => {
    try {
      const response = await likeStarApi.deleteOperation(userId, null, articleId, 'like');
      if (response.data.code === 1) {
        likedArticleIds.value = likedArticleIds.value.filter(id => id !== articleId);
      }
    } catch (error) {
      console.error('取消点赞失败:', error);
    }
  };

  // 添加收藏文章
  const addStar = async (userId, articleId) => {
    try {
      const response = await likeStarApi.addOperation(userId, null, articleId, 'star');
      if (response.data.code === 1) {
        starredArticleIds.value.push(articleId);
      }
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };

  // 删除收藏文章
  const removeStar = async (userId, articleId) => {
    try {
      const response = await likeStarApi.deleteOperation(userId, null, articleId, 'star');
      if (response.data.code === 1) {
        starredArticleIds.value = starredArticleIds.value.filter(id => id !== articleId);
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  // 添加点赞评论
  const addCommentLike = async (userId, commentId) => {
    try {
      const response = await likeStarApi.addOperation(userId, commentId, null, 'like');
      if (response.data.code === 1) {
        likedCommentIds.value.push(commentId); // 更新点赞的评论ID列表
      }
    } catch (error) {
      console.error('点赞评论失败:', error);
    }
  };

  // 取消点赞评论
  const removeCommentLike = async (userId, commentId) => {
    try {
      const response = await likeStarApi.deleteOperation(userId, commentId, null, 'like');
      if (response.data.code === 1) {
        likedCommentIds.value = likedCommentIds.value.filter(id => id !== commentId); // 移除取消点赞的评论ID
      }
    } catch (error) {
      console.error('取消点赞评论失败:', error);
    }
  };

  return {
    likedArticleIds,
    starredArticleIds,
    likedCommentIds,
    articlesByAuthor, // 新增的状态存储
    fetchLikedArticleIds,
    fetchStarredArticleIds,
    fetchLikedCommentIds, // 获取点赞评论的函数
    fetchArticlesByAuthorId, // 获取作者文章的函数
    addLike,
    removeLike,
    addStar,
    removeStar,
    addCommentLike, // 添加点赞评论的函数
    removeCommentLike, // 取消点赞评论的函数
  };
});
