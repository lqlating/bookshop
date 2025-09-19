<template>
  <div :class="['main-area', { subcomment: grandparent_id }]" v-bind="$attrs"
    @contextmenu.prevent="handleCommentRightClick">
    <div class="img-wrapper">
      <div class="avatar-container">
        <img :src="`data:image/png;base64,${avatar}`"
          :style="{ width: grandparent_id ? '24px' : '40px', height: grandparent_id ? '24px' : '40px' }" alt=""
          @contextmenu.prevent="handleAvatarRightClick">

        <div v-if="isUserContextMenuVisible" class="custom-menu">
          <div class="menu-item" @click="showUserReportDialog">举报</div>
        </div>
      </div>
    </div>
    <div class="content-wrapper">
      <div class="username">{{ userName }}</div>
      <div class="content">
        <span v-if="grandparent_id && comment.parent_id !== grandparent_id">
          回复
          <span class="subCommentUserName">{{ subCommentUserName }}</span>:
        </span>{{ comment.content }}
      </div>
      <div class="publish_date">{{ comment.publish_time }}</div>
      <div class="icons">
        <button class="like" @click="toggleLike">
          <i :class="isLiked ? 'fas fa-heart' : 'far fa-heart'" class="heart"></i>
          <span class="like_count" v-show="localLikeCount !== 0">{{ localLikeCount }}</span>
          <span class="like_count" v-show="localLikeCount === 0">赞</span>
        </button>
        <button class="reply-part" @click="handleReplyClick">
          <img class="reply" src="../../assets/img/_ico_reply.png" alt="回复">
          <span class="commentCount" v-show="subCommentCount !== 0">{{ subCommentCount }}</span>
          <span class="commentCount" v-show="subCommentCount === 0 || grandparent_id">回复</span>
        </button>
        <el-dropdown trigger="click" class="report-dropdown" teleported>
          <button class="report-btn">
            <el-icon class="more-icon">
              <MoreFilled />
            </el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="showReportDialog">举报</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 评论右键菜单 -->
    <div v-if="isCommentContextMenuVisible" class="custom-menu comment-menu">
      <div v-if="isOwnComment" class="menu-item delete-item" @click="showDeleteConfirm">删除</div>
      <div v-else class="menu-item" @click="showReportDialog">举报</div>
    </div>
  </div>

  <div v-if="visibleSubComments.length > 0" class="sub-comments">
    <Comment v-for="(subComment, index) in visibleSubComments" :key="subComment.comment_id" :comment="subComment"
      :article_id="article_id" :grandparent_id="comment.comment_id" v-bind="$attrs" />
    <button v-if="showMoreButtonText" class="show-more" @click="showMoreReplies">{{ showMoreButtonText }}</button>
  </div>

  <ReportDialog :is-visible="isReportDialogVisible" content-type="comment" :target-id="comment.comment_id"
    :report-content-id="comment.comment_id" :reporter-id="user_id" @close="closeReportDialog" />

  <ReportDialog :is-visible="isUserReportDialogVisible" content-type="user" :target-id="comment.user_id"
    :report-content-id="comment.user_id" :reporter-id="user_id" :extra-data="{ from: 'comment' }"
    @close="closeUserReportDialog" />

  <!-- 删除评论确认对话框 -->
  <el-dialog v-model="isDeleteConfirmVisible" title="删除评论" width="250px" center>
    <span>确定要删除这条评论吗？</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isDeleteConfirmVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="deleteComment" :loading="isDeleting" size="small">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { userInfoStore } from '../../store/user';
import { commentInfoStore } from '../../store/comment';
import { useLikeStore } from '../../store/likeStar';
import axios from 'axios';
import { editInfoStore } from '../../store/isEdit';
import ReportDialog from '../report/ReportDialog.vue';
import { MoreFilled } from '@element-plus/icons-vue';
import { ElMessage, ElDialog, ElButton } from 'element-plus';

const editStore = editInfoStore();
const { isEditing } = storeToRefs(editStore);
const userStore = userInfoStore();
const { isLogin, showLogin } = storeToRefs(userStore);
const commentStore = commentInfoStore();
const likeStore = useLikeStore();

const user_id = ref(userStore.userThing.id);
const likedCommentIds = storeToRefs(likeStore).likedCommentIds;
const { fetchLikedCommentIds } = likeStore;

const props = defineProps(['comment', 'article_id', 'grandparent_id']);
const { comment, article_id, grandparent_id } = props;

const userName = ref('');
const avatar = ref('');
const isLiked = ref(false);
const localLikeCount = ref(comment.like_count);
const userInfo = reactive({});
const subComments = computed(() => commentStore.subCommentsByParentId[comment.comment_id] || []);
const visibleSubComments = ref([]);
const showMoreButtonText = ref('');
const subCommentUserName = ref('');
const subCommentCount = computed(() => subComments.value.length);

const isReportDialogVisible = ref(false);
const isUserReportDialogVisible = ref(false);
const isUserContextMenuVisible = ref(false);
const isCommentContextMenuVisible = ref(false);
const isOwnComment = computed(() => user_id.value === comment.user_id);
const isDeleteConfirmVisible = ref(false);
const isDeleting = ref(false);

// 获取用户信息
const searchUserById = async (userId) => {
  try {
    const res = await axios.get(`http://localhost:8080/api/SearchUserById/${userId}`);
    Object.assign(userInfo, res.data.data);
    userName.value = userInfo[0].username;
    avatar.value = userInfo[0].avatar_base64;
  } catch (error) {
    console.error('搜索用户失败：', error);
  }
};

// 获取用户评论的用户信息
const getuserbyCommentid = async (c_id) => {
  if (grandparent_id) {
    try {
      const res = await axios.get(`http://localhost:8080/api/getUserByCommentId/${c_id}`);
      subCommentUserName.value = res.data.data[0].username;
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  }
};

// 加载子评论
const loadSubComments = async () => {
  if (!grandparent_id) {
    await commentStore.getSubComments(comment.comment_id);
    updateVisibleSubComments();
  }
};

// 点赞切换
const toggleLike = async () => {
  isLiked.value = !isLiked.value;
  localLikeCount.value += isLiked.value ? 1 : -1;

  if (isLiked.value) {
    await likeStore.addCommentLike(user_id.value, comment.comment_id);
    if (!likedCommentIds.value.includes(comment.comment_id)) {
      likedCommentIds.value.push(comment.comment_id);
    }
  } else {
    await likeStore.removeCommentLike(user_id.value, comment.comment_id);
    likedCommentIds.value = likedCommentIds.value.filter(id => id !== comment.comment_id);
  }
};

// 展开更多回复
const showMoreReplies = () => {
  visibleSubComments.value = subComments.value;
  showMoreButtonText.value = '';
};

// 处理回复点击事件
const handleReplyClick = () => {
  isEditing.value = !isEditing.value;
  if (grandparent_id) {
    commentStore.grandparent_id = grandparent_id;
  } else {
    commentStore.grandparent_id = props.comment.comment_id;
  }
  if (!commentStore.parent_id) {
    commentStore.tempSubComment.parent_id = comment.comment_id;
  } else {
    commentStore.tempSubComment.parent_id = null;
  }
};

// 更新可见的子评论
const updateVisibleSubComments = () => {
  if (subCommentCount.value > 1) {
    visibleSubComments.value = subComments.value.slice(0, 1);
    showMoreButtonText.value = `展开${subCommentCount.value - 1}条回复`;
  } else {
    visibleSubComments.value = subComments.value;
    showMoreButtonText.value = '';
  }
};

// 监听 likedCommentIds 的变化
watch(() => likedCommentIds.value, (newVal) => {
  isLiked.value = newVal.includes(comment.comment_id);
});

// 处理评论右键点击事件
const handleCommentRightClick = (event) => {
  event.preventDefault();
  if (!isLogin.value) {
    showLogin.value = true;
    return;
  }

  // 不再设置菜单位置，现在使用固定位置
  isCommentContextMenuVisible.value = true;

  // 添加全局点击事件来关闭菜单
  setTimeout(() => {
    document.addEventListener('click', closeCommentContextMenu);
  }, 0);
};

// 关闭评论上下文菜单
const closeCommentContextMenu = () => {
  isCommentContextMenuVisible.value = false;
  document.removeEventListener('click', closeCommentContextMenu);
};

// 显示删除确认对话框
const showDeleteConfirm = () => {
  isCommentContextMenuVisible.value = false;
  isDeleteConfirmVisible.value = true;
};

// 删除评论
const deleteComment = async () => {
  if (!isOwnComment.value) {
    ElMessage.error('只能删除自己的评论');
    isDeleteConfirmVisible.value = false;
    return;
  }

  isDeleting.value = true;
  try {
    const result = await commentStore.deleteComment(
      comment.comment_id,
      article_id,
      grandparent_id
    );

    if (result.success) {
      ElMessage.success('评论删除成功');
      isDeleteConfirmVisible.value = false;
    } else {
      ElMessage.error(result.message || '删除评论失败');
    }
  } catch (error) {
    console.error('删除评论出错:', error);
    ElMessage.error('删除评论失败，请稍后重试');
  } finally {
    isDeleting.value = false;
  }
};

// 组件挂载时获取用户信息和子评论
onMounted(async () => {
  await fetchLikedCommentIds(user_id.value);
  isLiked.value = likedCommentIds.value.includes(comment.comment_id);
  searchUserById(comment.user_id);
  loadSubComments();
  if (grandparent_id) {
    getuserbyCommentid(comment.parent_id);
  }

  // 初始化点击外部关闭菜单的事件
  document.addEventListener('click', (event) => {
    if (isCommentContextMenuVisible.value) {
      closeCommentContextMenu();
    }
    if (isUserContextMenuVisible.value) {
      closeContextMenu();
    }
  });
});

const showReportDialog = () => {
  if (!isLogin.value) {
    showLogin.value = true;
    return;
  }
  isReportDialogVisible.value = true;
  console.log('Opening report dialog:', isReportDialogVisible.value);
};

const closeReportDialog = () => {
  console.log('Closing report dialog');
  isReportDialogVisible.value = false;
};

// 处理头像右键点击事件
const handleAvatarRightClick = (event) => {
  event.preventDefault();
  if (!isLogin.value) {
    showLogin.value = true;
    return;
  }

  // 显示菜单
  isUserContextMenuVisible.value = true;

  // 添加全局点击事件来关闭菜单
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu);
  }, 0);
};

// 关闭上下文菜单
const closeContextMenu = () => {
  isUserContextMenuVisible.value = false;
  document.removeEventListener('click', closeContextMenu);
};

// 显示针对用户的举报对话框
const showUserReportDialog = () => {
  if (!isLogin.value) {
    showLogin.value = true;
    return;
  }
  isUserReportDialogVisible.value = true;
  isUserContextMenuVisible.value = false; // 关闭上下文菜单
};

// 关闭针对用户的举报对话框
const closeUserReportDialog = () => {
  isUserReportDialogVisible.value = false;
};
</script>

<style scoped>
.main-area {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}

.img-wrapper {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
}

.img-wrapper img {
  border-radius: 50%;
  cursor: context-menu;
}

.content-wrapper {
  flex: 1;
}

.username {
  color: #33333399;
  font-size: 14px;
  margin-bottom: 4px;
}

.content {
  font-size: 14px;
  color: #333333;
  text-align: justify;
  word-break: break-all;
  hyphens: auto;
  margin-bottom: 4px;
}

.publish_date {
  font-size: 12px;
  color: #33333399;
}

.icons {
  display: flex;
  align-items: center;
  margin-top: 10px;
  justify-content: flex-start;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 10px;
}

button img,
button .heart {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}

.like {
  color: #333333cc;
  font-weight: 500;
  font-size: 12px;
}

.heart {
  margin-top: 1px;
  font-size: 15px;
  color: red;
}

.reply {
  width: 16px;
  height: 16px;
}

.reply-part {
  margin-left: -10px;
  font-weight: 500;
  color: #333333cc;
  font-size: 12px;
}

.commentCount {
  margin-left: -2px;
}

.subcomment .content-wrapper {
  max-width: 90%;
}

.sub-comments {
  margin-left: 40px;
  margin-top: 10px;
  margin-bottom: 20px;
}

.sub-comment-item {
  margin-top: 10px;
}

.subCommentUserName {
  color: #33333399;
}

.like_count {
  margin-left: 5px;
}

.show-more {
  font-size: 14px;
  color: #13386c;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  display: block;
  margin-top: 10px;
}

.report-dropdown {
  margin-left: auto;
}

.report-btn {
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 24px;
  width: 24px;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.report-btn:hover {
  background-color: #f5f5f5;
}

.more-icon {
  font-size: 18px;
  color: #999;
  transition: all 0.3s;
}

.report-btn:hover .more-icon {
  color: #666;
}

.icons button,
.icons .report-dropdown {
  margin-right: 12px;
}

.icons>*:last-child {
  margin-right: 0;
}

:global(.el-popper) {
  z-index: 10001 !important;
}

/* 自定义右键菜单样式 */
.custom-menu {
  position: absolute;
  left: -7px;
  bottom: -38px;
  background: white;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 10002;
  min-width: 60px;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f5f5f5;
  color: #409eff;
}

/* 评论右键菜单样式 */
.comment-menu {
  position: absolute;
  top: 100%;
  /* 位于评论的下方 */
  left: 50%;
  /* 水平居中 */
  transform: translateX(-50%);
  /* 确保水平居中 */
  z-index: 10002;
}

.delete-item {
  color: #F56C6C;
}

.delete-item:hover {
  background-color: #f5f5f5;
  color: #F56C6C;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
}
</style>
