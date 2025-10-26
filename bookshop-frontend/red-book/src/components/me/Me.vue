<template>
  <div class="container">
    <div class="main-part">
      <span class="avatar-wrapper">
        <div v-if="loading" class="avatar-skeleton"></div>
        <img v-else class="avatar" :src="`data:image/png;base64,${userThing.avatar_base64}`" alt="用户头像">
      </span>
      <span class="info-thing">
        <div class="username-container">
          <div class="username">{{ username }}</div>
          <div class="edit-icon" @click="showEditProfile">
            <span class="edit-symbol">✎</span>
          </div>
        </div>
        <div class="id">账号id:{{ id }}</div>
        <div class="intro" v-if="introduction != undefined">介绍:{{ introduction }}</div>
        <div class="intro" v-if="introduction == undefined">还没有简介</div>
        <div v-if="gender == '男'">性别：<img class="gender" src="../../assets/img/male.png" alt=""></div>
        <div v-if="gender == '女'">性别：<img class="gender" src="../../assets/img/female.png" alt=""></div>

        <div class="subscript-thing" v-if="!isLoading">
          <span class="subscript-detail" style="color: #33333399;">关注 {{ userStats.subscriptionsCount }}</span>
          <span class="subscript-detail" style="color: #33333399;">粉丝 {{ userStats.fansCount }}</span>
          <span class="subscript-detail" style="color: #33333399;">获赞与收藏 {{ userStats.likesAndStarsCount }}</span>
        </div>
      </span>
    </div>

    <!-- 按钮组 -->
    <div class="sticky-buttons">
      <RouterLink to="/Me/Note" active-class="active" class="Lbutton">文章</RouterLink>
      <RouterLink to="/Me/Book" active-class="active" class="Lbutton">书籍</RouterLink>
      <RouterLink to="/Me/StarList" active-class="active" class="Lbutton">收藏</RouterLink>
      <RouterLink to="/Me/LikeList" active-class="active" class="Lbutton">点赞</RouterLink>
    </div>

    <!-- 路由视图 -->
    <div class="output">
      <RouterView></RouterView>
    </div>

    <!-- 编辑个人资料对话框 -->
    <div class="edit-profile-overlay" v-if="showEditDialog" @click.self="closeEditDialog">
      <EditProfile :userData="userThing" @close="closeEditDialog" @update-success="handleUpdateSuccess" />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { userInfoStore } from "../../store/user";
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import likeStarApi from '../../api/likeStarApi';
import subscriptApi from '../../api/subscriptApi';
import articleApi from '../../api/articleApi'; // 引入 articleApi
import EditProfile from '../profile/EditProfile.vue'; // 引入编辑个人资料组件

const userStore = userInfoStore();
const { userThing } = storeToRefs(userStore);
const { username, email, id, gender, introduction } = userThing.value;

const router = useRouter();
const isLoading = ref(true); // 新增一个变量来跟踪加载状态
const loading = ref(true);
const showEditDialog = ref(false); // 控制编辑对话框显示

// 定义 ref 变量来存储数据
const userStats = ref({
  fansCount: 0,
  subscriptionsCount: 0,
  likesAndStarsCount: 0,
});

const articles = ref([]); // 新增的容器，用于存放文章数据

// 显示编辑个人资料对话框
const showEditProfile = () => {
  showEditDialog.value = true;
};

// 关闭编辑个人资料对话框
const closeEditDialog = () => {
  showEditDialog.value = false;
};

// 处理更新成功
const handleUpdateSuccess = () => {
  showEditDialog.value = false;
  // 可能需要刷新页面或重新获取用户信息
  window.location.reload(); // 简单方式：刷新页面
};

onMounted(async () => {
  if (router.currentRoute.value.path === '/Me') {
    router.push('/Me/Note');
  }

  try {
    // 获取粉丝数量
    const fansResponse = await subscriptApi.getUserIdbyTargetId(id);
    userStats.value.fansCount = fansResponse.data.data.length;

    // 获取已订阅的用户数量
    const subscriptionsResponse = await subscriptApi.getTargetId(id);
    userStats.value.subscriptionsCount = subscriptionsResponse.data.data.length;

    // 获取用户文章
    const articlesResponse = await articleApi.getArticlesByAuthorId(id);
    articles.value = articlesResponse.data.data || []; // 确保是数组，如果为null则使用空数组

    // 提取 target_id 组成数组并调用 searchCount
    if (articles.value && articles.value.length > 0) {
      const targetIds = articles.value.map(article => article.article_id);

      if (targetIds.length > 0) {
        const likeCountResponse = await likeStarApi.searchCountByTargetIds(targetIds);
        userStats.value.likesAndStarsCount = likeCountResponse.data.data; // 假设返回的是点赞与收藏的数量
      } else {
        userStats.value.likesAndStarsCount = 0;
      }
    } else {
      userStats.value.likesAndStarsCount = 0;
    }

    isLoading.value = false; // 数据加载完成，关闭加载状态
    loading.value = false;  // 加载完成后设置loading为false
  } catch (error) {
    console.error("请求失败:", error);
    isLoading.value = false;
    loading.value = false;
  }
});
</script>

<style scoped>
/* 设置最大高度，并隐藏滚动条 */
.container {
  max-height: 600px;
  /* 设置最大高度 */
  overflow-y: scroll;
  /* 超出部分滚动 */
  scrollbar-width: none;
  /* 隐藏滚动条 */
  -ms-overflow-style: none;
  /* IE和Edge隐藏滚动条 */
}

.container::-webkit-scrollbar {
  display: none;
  /* Chrome和Safari隐藏滚动条 */
}

.avatar-wrapper {
  width: 210px;
  height: 147px;
}

.avatar {
  width: 147px;
  height: 147px;
  border-radius: 50%;
}

a {
  text-decoration: none;
}

.main-part {
  display: flex;
  width: 600.1px;
  height: 164px;
  margin: 0 288.45px;
  padding: 48px 0;
}

.username-container {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.username {
  font-size: 24px;
  color: #333;
  font-weight: bolder;
  margin-right: 10px;
}

.edit-icon {
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  background-color: #f5f5f5;
  border-radius: 50%;
  margin-left: 10px;
}

.edit-icon:hover {
  transform: scale(1.1);
  background-color: #ffe6ea;
}

.edit-symbol {
  font-size: 16px;
  color: #ff2e4d;
}

.id {
  color: #33333399;
  font-size: 12px;
  margin-bottom: 10px;
}

.intro {
  font-size: 14px;
  margin-bottom: 5px;
}

.gender {
  margin-bottom: -4px;
  width: 24px;
  height: 24px;
}

.subscript-thing {
  margin-bottom: 60px;
}

.subscript-detail {
  margin-right: 10px;
}

.subscript-inner {
  font-size: 14px;
  color: #33333399;
}

.active {
  font-weight: bolder;
  background-color: #f0f0f0;
}

.Lbutton {
  box-sizing: border-box;
  color: #333333cc;
  font-size: 16px;
  padding: 9px 16px;
  height: 40px;
  /* 保留原有高度 */
  border-radius: 16px;
}

/* 按钮组设置为 sticky，不改变高度 */
.sticky-buttons {
  padding-bottom: 20px;
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 10;

  background-color: white;
  /* 确保背景色与页面一致 */
}

.article-list {
  margin-top: 20px;
}

.avatar-skeleton {
  width: 147px;
  height: 147px;
  background-color: #e0e0e0;
  border-radius: 50%;
}

/* 编辑个人资料弹窗样式 */
.edit-profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>
