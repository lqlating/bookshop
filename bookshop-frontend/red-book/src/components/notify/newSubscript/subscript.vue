<template>
  <div class="main-area">
    <div class="left-area">
      <span class="avatar-area">
        <img class="avatar-inner" :src="`data:image/png;base64,${subscriptList.avatar_base64}`" alt="用户头像">
      </span>
      <span class="use-area">
        <div class="username-inner">{{ subscriptList.username }}</div>
        <div class="less-area">
          <!-- 根据 isMeinfo 决定显示的文本 -->
          <span v-if="isMeinfo">Ta关注了你，期待你的回关</span>
          <span v-else>小红书号：{{ subscriptList.id }}</span>
        </div>
      </span>
    </div>
    <div v-show="!isInteracting" class="subscript-area" @click="newSubscript">
      <!-- 根据 isMeinfo 显示不同的按钮文本 -->
      {{ isMeinfo ? '回关' : '关注' }}
    </div>
    <div v-show="isInteracting" class="inter-subscript" @click="deleteSubscript">
      <!-- 根据 isMeinfo 显示不同的按钮文本 -->
      {{ isMeinfo ? '互相关注' : '已关注' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs, onMounted } from 'vue';
import { userInfoStore } from '../../../store/user';
import subscriptApi from '../../../api/subscriptApi';

// 定义 props 的类型
interface SubscriptList {
  id: number;
  avatar_base64: string;
  username: string;
  interaction: boolean;
}

// 接收 props
const props = defineProps<{
  subscriptList: SubscriptList;
  isMeinfo: boolean; // 新增 isMeinfo prop
}>();

// 引入用户信息 store
const userStore = userInfoStore();
const { userThing } = toRefs(userStore);

// 创建一个本地状态变量来跟踪交互状态
const isInteracting = ref(props.subscriptList.interaction);

// 监视 props.subscriptList.interaction 的变化，确保本地状态同步
watch(
  () => props.subscriptList.interaction,
  (newVal) => {
    isInteracting.value = newVal;
  }
);

// 点击"回关"或"关注"按钮的处理函数
async function newSubscript() {
  isInteracting.value = true;
  try {
    await subscriptApi.insertSubscript(userThing.value.id, props.subscriptList.id);
    console.log("成功关注");
  } catch (error) {
    console.error("关注失败:", error);
    isInteracting.value = false;
  }
}

// 点击"互相关注"或"已关注"按钮的处理函数
async function deleteSubscript() {
  isInteracting.value = false;
  try {
    await subscriptApi.deleteSubscript(userThing.value.id, props.subscriptList.id);
    console.log("成功取消关注");
  } catch (error) {
    console.error("取消关注失败:", error);
    isInteracting.value = true;
  }
}

</script>

<style scoped>
.main-area {
  height: 88.8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
}

.left-area {
  display: flex;
  align-items: center;
}

.avatar-area {
  height: 48px;
  width: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 30px;
}

.avatar-inner {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.use-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.username-inner {
  font-size: 16px;
  color: #333333;
  font-weight: 600;
}

.less-area {
  font-size: 14px;
  color: #33333399;
}

.inter-subscript,
.subscript-area {
  cursor: pointer;
  width: 96px;
  height: 40px;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s, border 0.3s;
}

.subscript-area {
  background-color: #ff2e4d;
  color: white;
}

.subscript-area:hover {
  background-color: #e02a48;
}

.inter-subscript {
  border: 1px solid rgb(219, 211, 211);
  color: #333;
  background-color: transparent;
}

.inter-subscript:hover {
  background-color: #f0f0f0;
}
</style>
