<template>
  <div class="article-inner" v-if="localArticleInner">
    <span class="article_img_inner" @click="openOverlay">
      <div class="image-container">
        <img :src="img_url ? `data:image/png;base64,${img_url}` : '/images/default_image.jpg'" alt="Article Image"
          :class="{ 'fit-height': isTallImage, 'fit-width': !isTallImage }" />
        <div v-if="props.article.is_review === 0" class="unreviewed-overlay">
          <span class="unreviewed-text">未审核</span>
        </div>
      </div>
    </span>
    <span>
      <div class="user-inner">
        <!-- 头像使用右键点击 -->
        <div class="avatar-container">
          <img v-if="avatar" :src="avatar ? `data:image/png;base64,${avatar}` : '/images/default_image.jpg'"
            alt="User Avatar" @contextmenu.prevent="handleAvatarRightClick" />

          <!-- 简单的自定义右键菜单 -->
          <div v-if="isUserContextMenuVisible" class="custom-menu">
            <div class="menu-item" @click="showUserReportDialog">举报</div>
          </div>
        </div>
        <span class="username-info" v-if="userName">{{ userName }}</span>
        <span class="subscribe" @click="subscribe()" v-show="!is_subscript">关注</span>
        <span class="no_subscribe" @click="subscribe()" v-show="is_subscript && isLogin">已关注</span>
      </div>
      <div class="article-comment">
        <div class="articleContent">
          <div class="inner-title">{{ articleTitle }}</div>
          <div class="inner-content">{{ content }}</div>
          <div class="date">
            {{ publication_time }} {{ address }}
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
          <hr class="article-comment-hr" />
          <div class="comment_count">共 <span>{{ commentCount }}</span> 条评论</div>
          <Comment class="subcomment" :comment="comment" v-for="comment in comment_content" :key="comment.id"
            :article_id="article_id"></Comment>
          <div class="end"> -THE END-</div>
        </div>
      </div>
      <ReplyPart :commentCount="commentCount" :like_count="like_count" :star_count="star_count" :article_id="article_id"
        :like="like"></ReplyPart>
    </span>

    <!-- 毛玻璃遮罩层 -->
    <div class="overlay" v-if="isOverlayOpen" @click="closeOverlay">
      <img :src="img_url ? `data:image/png;base64,${img_url}` : '/images/default_image.jpg'" alt="Overlay Image"
        class="overlay-image" />
    </div>
  </div>
  <div class="mask" v-if="localArticleInner" @click="closeArticleInner"></div>

  <!-- 针对文章的举报对话框 -->
  <ReportDialog :is-visible="isReportDialogVisible" content-type="article" :target-id="article_id"
    :report-content-id="article_id" :reporter-id="currentUserId" :extra-data="{ author_id: author_id }"
    @close="closeReportDialog" />

  <!-- 针对用户的举报对话框 -->
  <ReportDialog :is-visible="isUserReportDialogVisible" content-type="user" :target-id="author_id"
    :report-content-id="author_id" :reporter-id="currentUserId" :extra-data="{ from: 'avatar' }"
    @close="closeUserReportDialog" />
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import Comment from "../comment/Comment.vue";
import ReplyPart from "../comment/replyPart.vue";
import { userInfoStore } from "../../store/user";
import { storeToRefs } from "pinia";
import { commentInfoStore } from "../../store/comment";
import userApi from "../../api/userApi";
import subscriptApi from "../../api/subscriptApi";
import ReportDialog from '../report/ReportDialog.vue';
import reportApi from '../../api/reportApi';
import { MoreFilled } from '@element-plus/icons-vue';

const props = defineProps({
  article: Object,
  article_inner: Boolean,
  close: Function,
  currentUserId: [String, Number]
});

// 从 props 解构数据
let {
  title: articleTitle,
  img_url,
  like_count,
  star_count,
  author_id,
  content,
  article_id,
  publication_time,
  address,
} = props.article;

// Store 的引用
const commentStore = commentInfoStore();
const { getComments, getCommentCount, commentsByArticleId, commentCountByArticleId, tempSubComment } = commentStore;

const userStore = userInfoStore();
const { showLogin, isLogin, targetIds, userThing } = storeToRefs(userStore);

// 状态数据
const like = ref(false);
const userInfo = ref({});
const userName = ref("");
const avatar = ref("");
const isOverlayOpen = ref(false); // 控制遮罩层的状态
const isReportDialogVisible = ref(false);
const isUserReportDialogVisible = ref(false);
const isUserContextMenuVisible = ref(false);

// 计算属性
const commentCount = computed(() => commentCountByArticleId[article_id] || 0);
const comment_content = computed(() => commentsByArticleId[article_id] || []);
const is_subscript = computed(() => targetIds.value.includes(author_id));
const isTallImage = computed(() => {
  if (img_url) {
    const img = new Image();
    img.src = `data:image/png;base64,${img_url}`;
    return img.height > img.width;
  }
  return false;
});

// 计算 localArticleInner
const localArticleInner = computed(() => props.article_inner);

// 数据加载逻辑封装
async function loadArticleData() {
  try {
    userName.value = "";
    avatar.value = "";
    const result = await userApi.SearchUserById(author_id);
    userInfo.value = result.data.data[0];
    userName.value = userInfo.value.username;
    avatar.value = userInfo.value.avatar_base64;
    await getComments(article_id);
    await getCommentCount(article_id);
  } catch (error) {
    console.error("加载文章数据失败：", error);
  }
}

// 订阅逻辑
function subscribe() {
  if (!isLogin.value) {
    closeArticleInner();
    showLogin.value = true;
  } else {
    if (is_subscript.value) {
      subscriptApi.deleteSubscript(userThing.value.id, author_id);
      targetIds.value = targetIds.value.filter((id) => id !== author_id);
    } else {
      subscriptApi.insertSubscript(userThing.value.id, author_id);
      targetIds.value.push(author_id);
    }
  }
}

// 遮罩层逻辑
function openOverlay() {
  isOverlayOpen.value = true;
}
function closeOverlay() {
  isOverlayOpen.value = false;
}
// 关闭文章详情的逻辑
function closeArticleInner() {
  props.close();
}

// 显示针对文章的举报对话框
const showReportDialog = () => {
  if (!isLogin.value) {
    showLogin.value = true;
    return;
  }
  isReportDialogVisible.value = true;
};
// 关闭针对文章的举报对话框
const closeReportDialog = () => {
  console.log('Closing dialog');
  isReportDialogVisible.value = false;
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

onMounted(() => {
  tempSubComment.article_id = article_id;
  tempSubComment.user_id = userThing.value.id;
  loadArticleData();
});

watch(() => props.article, async (newValue) => {
  articleTitle = newValue.title;
  img_url = newValue.img_url;
  like_count = newValue.like_count;
  star_count = newValue.star_count;
  author_id = newValue.author_id;
  content = newValue.content;
  article_id = newValue.article_id;
  publication_time = newValue.publication_time;
  address = newValue.address;
  await loadArticleData();
});
</script>

<style scoped>
.article-inner {
  display: flex;
  position: fixed;
  background-color: white;
  width: 880px;
  height: 600px;
  z-index: 9999;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  overflow: hidden;
}

.article-inner .article_img_inner {
  width: 53%;
  height: 100%;
  border-right: 1px solid #f1eeee;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fit-height {
  height: 100%;
}

.fit-width {
  height: auto;
  max-height: 100%;
}

.article_img_inner+span {
  width: 47%;
}

.user-inner {
  border-bottom: 0.1px solid rgb(232, 223, 223);
  box-sizing: border-box;
  height: 88.8px;
  padding: 24px;
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

/* 头像容器样式 */
.avatar-container {
  position: relative;
  margin-right: 12px;
}

.user-inner img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgb(205, 189, 189);
  cursor: context-menu;
  /* 提示用户这里可以右键 */
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

.username-info {
  color: #666666cc;
  height: 40px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.subscribe,
.no_subscribe {
  font-weight: 600;
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 100px;
  width: 96px;
  height: 40px;
}

.subscribe {
  color: white;
  background-color: #FF2E4D;
}

.no_subscribe {
  color: #333333;
  border: 1px solid rgb(238, 231, 231);
}

.article-comment {
  height: 439.2px;
  overflow: auto;
}

.article-comment::-webkit-scrollbar {
  display: none;
}

.articleContent {
  padding: 24px;
}

.articleContent .inner-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.inner-content {
  font-size: 16px;
  font-weight: 400;
  color: #333333;
  margin-bottom: 24px;
}

.article-comment-hr {
  border: 0.0001px solid rgb(236, 233, 233);
}

.comment_count {
  margin-bottom: 10px;
  font-size: 14px;
  color: #33333399;
}

.mask {
  height: 706.8px;
  width: 1920px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(31, 29, 29, 0.5);
  z-index: 1999;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.overlay-image {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  width: auto;
}

.end {
  color: #33333399;
  font-size: 12px;
  margin: 10px 150px;
}

.date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #33333399;
  font-weight: 520;
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

:global(.el-popper) {
  z-index: 10001 !important;
}

.unreviewed-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.unreviewed-text {
  color: white;
  font-size: 20px;
  font-weight: bold;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
}
</style>
