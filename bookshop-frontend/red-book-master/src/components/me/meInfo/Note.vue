<template>
  <div class="user-notes-container">
    <!-- 未发布文章时的空状态 -->
    <div v-if="articlesByAuthor.length === 0" class="empty-state">
      <div class="empty-avatar">
        <img src="../../../assets/img/head.png" alt="用户头像">
      </div>
      <div class="empty-message">你暂未发布任何文章</div>
    </div>

    <!-- 已发布文章列表 -->
    <div v-else class="notes-list-container">
      <ArticleDisplay ref="articleDisplayRef" :articleLists="articlesByAuthor" @contextmenu="handleContextMenu" />

      <!-- 自定义右键菜单 -->
      <div v-show="showContextMenu" class="custom-context-menu" :style="contextMenuStyle">
        <button class="menu-item delete-btn" @click.stop="deleteArticle">
          <span class="icon">🗑️</span>
          <span>删除文章</span>
        </button>
      </div>

      <!-- 自定义确认对话框 -->
      <div v-if="showConfirmDialog" class="custom-dialog-overlay">
        <div class="custom-dialog">
          <div class="dialog-header">
            <h3>确认删除</h3>
          </div>
          <div class="dialog-body">
            <p>确定要删除这篇文章吗？删除后无法恢复。</p>
          </div>
          <div class="dialog-footer">
            <button class="cancel-btn" @click="cancelDelete">取消</button>
            <button class="confirm-btn" @click="confirmDelete">确认删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useLikeStore } from '../../../store/likeStar';
import { userInfoStore } from '../../../store/user';
import articleApi from '../../../api/articleApi';
import ArticleDisplay from '../../discover/ArticleDisplay.vue';

const userStore = userInfoStore();
const userId = userStore.userThing.id;

const likeStore = useLikeStore();
const { articlesByAuthor } = storeToRefs(likeStore);
const { fetchArticlesByAuthorId } = likeStore;

// 右键菜单相关状态
const showContextMenu = ref(false);
const contextMenuStyle = ref({
  top: '0px',
  left: '0px'
});
const currentArticle = ref(null);

// 确认对话框相关状态
const showConfirmDialog = ref(false);

// 显示右键菜单
const handleContextMenu = (event, article) => {
  event.preventDefault();
  currentArticle.value = article;
  showContextMenu.value = true;
  contextMenuStyle.value.top = `${event.clientY}px`;
  contextMenuStyle.value.left = `${event.clientX}px`;
};

// 删除文章 - 第一步：显示确认对话框
const deleteArticle = () => {
  if (!currentArticle.value) return;
  showConfirmDialog.value = true;
  showContextMenu.value = false;
};

// 取消删除
const cancelDelete = () => {
  showConfirmDialog.value = false;
  currentArticle.value = null;
};

// 确认删除
const confirmDelete = async () => {
  try {
    const articleId = currentArticle.value.article_id;
    const response = await articleApi.deleteArticle(articleId);

    if (response.data && response.data.code === 1) {
      // 从本地数组中直接移除已删除的文章，不再需要重新获取
      const index = articlesByAuthor.value.findIndex(article => article.article_id === articleId);
      if (index !== -1) {
        articlesByAuthor.value.splice(index, 1);
      }
      showToast('文章删除成功', 'success');
    } else {
      showToast(response.data?.data || '删除文章失败', 'error');
    }
  } catch (error) {
    console.error("删除文章时出错:", error);
    showToast('删除文章时出错', 'error');
  } finally {
    showConfirmDialog.value = false;
    currentArticle.value = null;
  }
};

// 自定义Toast通知
const showToast = (message, type) => {
  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// 点击页面其他地方关闭右键菜单
const handleClickOutside = () => {
  showContextMenu.value = false;
};

onMounted(async () => {
  if (articlesByAuthor.value.length === 0) {
    try {
      await fetchArticlesByAuthorId(userId);
    } catch (error) {
      console.error("获取作者文章时出错:", error);
      showToast('获取文章列表失败', 'error');
    }
  }

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.user-notes-container {
  width: 100%;
  min-height: 60vh;
  padding: 20px;
  box-sizing: border-box;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
}

.empty-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ff2e4d;
  padding: 5px;
  margin-bottom: 20px;
}

.empty-message {
  font-size: 18px;
  color: #666;
  margin-bottom: 25px;
}

/* 文章列表容器 */
.notes-list-container {
  position: relative;
  margin-top: 20px;
}

/* 自定义右键菜单 */
.custom-context-menu {
  position: fixed;
  z-index: 1000;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 160px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: #f9f9f9;
}

.menu-item .icon {
  margin-right: 8px;
  font-size: 16px;
}

.delete-btn {
  color: #ff2e4d;
}

/* 自定义对话框 */
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.custom-dialog {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: dialogFadeIn 0.3s ease;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.dialog-body {
  padding: 20px;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  gap: 10px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background-color: #eaeaea;
}

.confirm-btn {
  background-color: #ff2e4d;
  color: white;
  border: none;
}

.confirm-btn:hover {
  background-color: #e02745;
}
</style>

<style>
/* 全局Toast样式 */
.custom-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  z-index: 3000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 1;
  transition: opacity 0.3s ease;
}

.custom-toast.success {
  background-color: #4caf50;
}

.custom-toast.error {
  background-color: #ff2e4d;
}

.custom-toast.fade-out {
  opacity: 0;
}
</style>