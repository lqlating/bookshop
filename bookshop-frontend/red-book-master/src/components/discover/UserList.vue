<template>
  <div class="main-body">
    <!-- 当 userList 不为空时，渲染 Subscript 组件 -->
    <template v-if="userList && userList.length > 0">
      <Subscript
        :isMeinfo="false"
        v-for="subscriptList in userList"
        :key="subscriptList.id"
        :subscriptList="subscriptList"
      />
      <div class="end-line">- THE END -</div>
    </template>

    <!-- 当 userList 为空时，显示 '没有符合要求的用户' -->
    <div v-else class="none">没有符合要求的用户~</div>
  </div>
</template>

<script setup>
import Subscript from '../notify/newSubscript/subscript.vue'; // Assuming the file is named Subscript.vue
import { searchStore } from '../../store/search'; // Adjust the path as necessary

const useSearchStore = searchStore();
const { userList } = useSearchStore;
</script>

<style scoped>
.end-line {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #33333399;
}
.none{
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  color: #33333399;
}
.main-body {
  overflow-y: auto; /* Enable vertical scrolling */
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  -ms-overflow-style: none; /* Hide scrollbar for IE and Edge */
}

/* Hide scrollbar for WebKit browsers */
.main-body::-webkit-scrollbar {
  display: none;
}
</style>
