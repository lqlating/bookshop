<template>
  <div class="main-body ni">
    <div class="left" :style="leftStyle">
      <!-- 显示加载中的占位符或头像 -->
      <div v-if="loading" class="avatar-skeleton"></div>
      <img v-else class="avatar" :src="`data:image/png;base64,${avatar}`" />

      <!-- 显示加载中的用户名占位符或用户名 -->
      <span v-if="loading" class="username-skeleton"></span>
      <span v-else class="username">{{ username }}</span>
    </div>
    <div class="right" :style="rightStyle">
      <!-- 点赞图标 -->
      <i :class="isLiked ? 'fas fa-heart' : 'far fa-heart'" @click="toggleLike" class="like-icon"></i>

      <!-- 显示点赞数 -->
      <span v-show="likeCount > 0" class="like_count">{{ likeCount }}</span>
      <span v-show="likeCount == 0" class="like_count">赞</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useLikeStore } from '../../store/likeStar';
import { userInfoStore } from '../../store/user';
import { storeToRefs } from 'pinia';
import userApi from '../../api/userApi';
import { articleStore } from '../../store/article';

// 获取store实例
const userStore = userInfoStore();
const { userThing } = userStore;
const { showLogin, isLogin } = storeToRefs(userStore)
const likeStore = useLikeStore();
const { fetchLikedArticleIds, addLike, removeLike } = likeStore;
const { likedArticleIds } = storeToRefs(likeStore);

// 获取文章store实例
const articleStores = articleStore();
const { getLikeCountByArticleId, likeCountMap } = articleStores;

// props
const props = defineProps({
  item: Object,
  out: { type: Boolean, default: false }
});
const { article_id } = props.item;

// 定义响应式变量
const username = ref('');
const avatar = ref('');
const loading = ref(true);  // 加入loading状态

// 计算是否已点赞
const isLiked = computed(() => likedArticleIds.value.includes(article_id));

// 从store中获取当前文章的点赞数
const likeCount = computed(() => getLikeCountByArticleId(article_id));

// 获取作者信息
async function getAuthorThing() {
  // console.log("this place",props.item.author_id)
  const res = await userApi.SearchUserById(props.item.author_id);
  username.value = res.data.data[0].username;
  avatar.value = res.data.data[0].avatar_base64;
  loading.value = false; // 数据加载完成，设置loading为false
}

// 点赞/取消点赞功能
async function toggleLike() {

  if (!isLogin.value) {

    showLogin.value = true;
  } else {
    if (isLiked.value) {
      await removeLike(userThing.id, article_id);
      if (likeCountMap[article_id] > 0) {
        likeCountMap[article_id] -= 1;
      }
    } else {
      await addLike(userThing.id, article_id);
      likeCountMap[article_id] += 1;
    }
  }

}

// 动态计算左边和右边的样式
const leftStyle = computed(() => ({
  marginLeft: props.out ? '-49px' : '0'
}));

const rightStyle = computed(() => ({
  marginRight: props.out ? '-49px' : '0'
}));

// 页面挂载时执行
onMounted(async () => {
  await fetchLikedArticleIds(userThing.id); // 加载用户点赞数据
  await getAuthorThing(); // 加载作者信息
});
</script>

<style scoped>
.main-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
}

.left {
  display: flex;
  align-items: center;
}

.avatar {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  overflow: hidden;
  margin-right: 8px;
}

.username {
  color: #333333cc;
  font-size: 12px;
  width: 75px;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.like_count {
  color: #333333cc;
  font-size: 12px;
}

html .right .like_count {
  margin-top: -2px;
  margin-left: 3px;
}

.right {
  display: flex;
  align-items: center;
}

.like-icon {
  font-size: 12px;
  margin-left: 8px;
  cursor: pointer;
  color: red;
}

/* 加载中的占位符样式 */
.avatar-skeleton {
  width: 20px;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 50%;
  margin-right: 8px;
}

.username-skeleton {
  width: 75px;
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 4px;
}
</style>
