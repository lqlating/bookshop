<template>
  <div class="post-comment">
    <input class="comment_place" placeholder="说点什么..." type="text" v-model="commentText" @click="openEdit()" />
    <transition name="fade">
      <div v-if="!isEditing" class="icon-container">
        <div>
          <i :class="[isLiked ? 'fas fa-heart red-heart' : 'far fa-heart', 'like_thing']"
            @click="isLiked ? handleUnlike() : handleLike()" :style="{ fontSize: '18px' }"></i>
          <span class="down_thing like_count_inner">
            {{ likeCount }}
          </span>
        </div>
        <div>
          <img v-show="!star_result" @click="addStar" class="star" src="../../assets/img/star.png" alt="" />
          <img v-show="star_result" @click="subStar" class="star" src="../../assets/img/star_1.png" alt="" />
          <span class="new_down_thing">
            {{ star_count }}
          </span>
        </div>
        <div>
          <img class="reply" @click="toggleEdit" src="../../assets/img/_ico_reply.png" alt="" />
          <span class="new_down_thing">{{ props.commentCount }}</span>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="isEditing" class="edit-container">
        <span class="aite">@</span>
        <button @click="tempSubComment.parent_id ? newSubmitSubComment() : newsubmitComment()"
          :class="{ 'disabled': commentText.length === 0 }" class="go">
          发送
        </button>
        <button @click="cancelEdit" class="cancel">取消</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useLikeStore } from '../../store/likeStar';
import { articleStore } from '../../store/article';
import { userInfoStore } from '../../store/user';
import { commentInfoStore } from '../../store/comment';
import { editInfoStore } from '../../store/isEdit';
import { containsDirtyWords } from '../../utils/formValidation';
import { ElMessage } from 'element-plus';

// Stores
const likeStore = useLikeStore();
const article = articleStore();
const userStore = userInfoStore();
const commentStore = commentInfoStore();
const editStore = editInfoStore();

// Extracting data from stores
const { isEditing } = storeToRefs(editStore);
const { submitComment, submitSubComment, tempSubComment } = commentStore;
const user_id = ref(userStore.userThing.id);
const props = defineProps(['commentCount', 'star_count', 'article_id', 'comments']);

// Local state
const commentText = ref('');
const star_result = ref(false);
const star_count = ref(props.star_count);

// Computed properties for like status and like count
const isLiked = computed(() => likeStore.likedArticleIds.includes(props.article_id));
const likeCount = computed(() => article.getLikeCountByArticleId(props.article_id));

// Check if the article is already starred
const isStarred = computed(() => likeStore.starredArticleIds.includes(props.article_id));

// Functions for submitting comments
const newsubmitComment = async () => {
  if (containsDirtyWords(commentText.value)) {
    ElMessage.error('评论包含不适当的内容，请修改后再发送');
    return;
  }

  const comment = {
    content: commentText.value,
    user_id: user_id.value,
    article_id: props.article_id,
  };

  try {
    const success = await submitComment(comment);
    if (success) {
      commentText.value = '';
      isEditing.value = false;
    }
    // 如果提交失败，保留用户输入，让他们可以编辑后重试
  } catch (error) {
    console.error('评论提交失败:', error);
    ElMessage.error('评论提交失败，请稍后重试');
  }
};

const newSubmitSubComment = async () => {
  if (containsDirtyWords(commentText.value)) {
    ElMessage.error('评论包含不适当的内容，请修改后再发送');
    return;
  }

  tempSubComment.content = commentText.value;

  try {
    const success = await submitSubComment();
    if (success) {
      commentText.value = '';
      isEditing.value = false;
    }
    // 如果提交失败，保留用户输入，让他们可以编辑后重试
  } catch (error) {
    console.error('回复提交失败:', error);
    ElMessage.error('回复提交失败，请稍后重试');
  }
};

// Like and Unlike functions
async function handleLike() {
  await likeStore.addLike(user_id.value, props.article_id);
  article.likeCountMap[props.article_id] += 1; // Directly modify article store
}

async function handleUnlike() {
  await likeStore.removeLike(user_id.value, props.article_id);
  article.likeCountMap[props.article_id] -= 1; // Directly modify article store
}

// Star related functions
async function addStar() {
  await likeStore.addStar(user_id.value, props.article_id);
  star_result.value = true;
  star_count.value++;
}

async function subStar() {
  await likeStore.removeStar(user_id.value, props.article_id);
  star_result.value = false;
  star_count.value--;
}

// Editing functions
function toggleEdit() {
  isEditing.value = !isEditing.value;
}

const cancelEdit = () => {
  isEditing.value = false;
  commentText.value = '';
};

function openEdit() {
  isEditing.value = true;
}

// Mounted lifecycle to fetch starred articles and update star status
onMounted(async () => {
  // Fetch the starred articles first
  await likeStore.fetchStarredArticleIds(user_id.value);

  // Check if the current article is starred
  star_result.value = isStarred.value;
});

// Watch the isStarred computed property and update star_result accordingly
watch(isStarred, (newVal) => {
  star_result.value = newVal;
});
</script>

<style scoped>
.post-comment {
  border-top: 0.1px solid rgb(232, 223, 223);
  height: 72.8px;
  padding: 0px 0px 0px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.comment_place {
  border-radius: 20px;
  width: 165.7px;
  height: 40px;
  background-color: #f3f3f3;
  border: none;
  text-indent: 16px;
}

.down_thing {
  font-weight: 500;
  margin-right: 20px;
  font-size: 14px;
  margin-left: 6px;
  color: #333333;
  display: inline-block;
  vertical-align: middle;
  /* 文字垂直居中 */
  margin-top: 4px;
}

.new_down_thing {
  font-weight: 500;
  margin-right: 20px;
  margin-left: 6px;
  font-size: 14px;
  color: #333333;
  display: inline-block;
  margin-top: 10px;
  vertical-align: middle;
  /* 文字垂直居中 */
}

.comment_place:focus {
  outline: none;
}

.icon-container,
.edit-container {
  display: flex;
  align-items: center;
  position: absolute;
  right: 16px;
}

.icon-container {
  top: 17px;
}

.icon-container div {
  display: flex;
  align-items: center;
  /* 垂直居中对齐图标和文字 */
}

.fas.fa-heart,
.far.fa-heart,
.reply,
.star {
  font-size: 22px;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
  /* 图标垂直居中 */
}

.red-heart {
  color: red;
}

.like_thing {
  margin-top: 10px;
}

.like_count_inner {
  padding-top: 5px;
}

.reply,
.star {
  width: 22px;
  height: 20px;
  margin-top: 10px;
  cursor: pointer;
}

.aite {
  margin-right: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.go,
.cancel {
  width: 64px;
  height: 40px;
  margin-right: 15px;
  border-radius: 44px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.go {
  font-weight: bold;
  color: white;
  background-color: #ff2442;
  border: none;
  font-size: 16px;
}

.go.disabled {
  background-color: #ffd5db;
}

.cancel {
  font-weight: bold;
  font-size: 16px;
  border: 0.5px solid #a8a5a5;
  background-color: white;
}

/* 定义 fade 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
