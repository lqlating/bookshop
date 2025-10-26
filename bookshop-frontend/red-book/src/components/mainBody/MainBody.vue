<template>
  <div>
    <div class="outer-overlay" v-if="showLogin" @click="closeLoginDialog">
      <div class="inner-overlay" @click.stop>
        <Login :showLogin="showLogin" class="Login" @update:showLogin="updateShowLogin"
          @showRegister="showRegisterForm" />
      </div>
    </div>

    <div class="outer-overlay" v-if="showRegister" @click="closeRegisterDialog">
      <div class="inner-overlay" @click.stop>
        <Register :showRegister="showRegister" class="Register" @update:showRegister="updateShowRegister"
          @showLogin="showLoginForm" />
      </div>
    </div>

    <div class="mainBody-wrapper">
      <div class="navigate">
        <!-- 广场入口 - 修改点击处理方法 -->
        <RouterLink to="/Discover" active-class="active" class="my-txt" @click="resetSearchAndNavigate">
          <span class="txt-inner">
            <img class="icon" src="@/assets/img/House.png" alt=""> 广场
          </span>
        </RouterLink>
        <RouterLink to="/Market" active-class="active" class="my-txt" @click="setIsSearchFalse">
          <span class="txt-inner">
            <img class="icon" src="@/assets/img/wallet.png" alt=""> 商场
          </span>
        </RouterLink>

        <!-- 仅在登录状态下显示的按钮 -->
        <RouterLink v-if="isLogin" to="/Cart" active-class="active" class="my-txt" @click="setIsSearchFalse">
          <span class="txt-inner">
            <img class="icon" src="@/assets/img/cart.png" alt=""> 购物车
          </span>
        </RouterLink>
        <RouterLink v-if="isLogin" to="/Publish" active-class="active" class="my-txt">
          <span class="txt-inner">
            <img class="icon" src="@/assets/img/shizikuang.png" alt=""> 发布
          </span>
        </RouterLink>
        <RouterLink v-if="isLogin" to="/Notify/becomment" active-class="active" class="my-txt">
          <span class="txt-inner">
            <div class="icon-wrapper">
              <img class="icon" src="@/assets/img/ringlingsheng.png" alt="">
              <div v-if="totalUnreadCount.value > 0" class="unread-dot"></div>
            </div>
            通知
          </span>
        </RouterLink>
        <RouterLink v-if="isLogin" to="/Me/Note" active-class="active" class="my-txt">
          <span class="txt-inner">
            <div v-if="!userThing.avatar_base64" class="avatar-skeleton"></div>
            <img v-else class="icon me" :src="`data:image/png;base64,${userThing.avatar_base64}`" alt="用户头像"> 我
          </span>
        </RouterLink>
        <div v-if="!isLogin" class="login" @click="openLoginDialog">登录</div>
        <div ref="moreButton" @click="showDropDown" class="more" :class="['my-txt']">
          <img class="more_pic" src="@/assets/img/more_.png" alt="">
          更多
        </div>
        <div class="drop-down2" v-show="showDrop && isLogin"
          :style="{ top: `${dropDownPosition.top}px`, left: `${dropDownPosition.left}px` }" @click.stop>
          <p class="more-inner">关于作者</p>
          <p class="more-inner">隐私、协议</p>
          <p class="more-inner" @click="logout">退出登录</p>
        </div>
      </div>

      <div class="main-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Login from "../login/Login.vue";
import Register from "../login/Register.vue";
import { userInfoStore } from '../../store/user';
import { storeToRefs } from 'pinia';
import { searchStore } from "@/store/search";
import { articleStore } from '../../store/article';
import { conversationStore } from '@/store/conversation';
import { ElMessage } from 'element-plus';

const useArticleStore = articleStore();
const { filterContent } = useArticleStore;
const userStore = userInfoStore();
const { isLogin, userThing, showLogin } = storeToRefs(userStore);
const search = searchStore();
const { isSearch } = storeToRefs(search);
const { resetSearch } = search;
const conversationStoreInstance = conversationStore();
const { totalUnreadCount } = storeToRefs(conversationStoreInstance);
console.log(userThing.value);

const router = useRouter();
const route = useRoute();

// 控制对话框显示
// const showLogin = ref(false);  // 删除本地 showLogin
const showRegister = ref(false);

// 对话框控制函数
const openLoginDialog = () => {
  userStore.showLogin = true;  // 修改为使用 store 的 showLogin
};

const closeLoginDialog = () => {
  userStore.showLogin = false;  // 修改为使用 store 的 showLogin
};

const openRegisterDialog = () => {
  showRegister.value = true;
};

const closeRegisterDialog = () => {
  showRegister.value = false;
};

const externalLink = "http://localhost:5174/";

const isActive = computed(() => route.fullPath === '/Publish');

const showDrop = ref(false);
const dropDownPosition = ref({ top: 0, left: 0 });

const moreButton = ref(null);

const showDropDown = () => {
  showDrop.value = !showDrop.value;
  nextTick(() => {
    if (moreButton.value) {
      const rect = moreButton.value.getBoundingClientRect();
      dropDownPosition.value = {
        top: rect.top - 200,
        left: rect.left
      };
    }
  });
};

const updateShowLogin = (value) => {
  userStore.showLogin = value;
}

const updateShowRegister = (value) => {
  showRegister.value = value;
}

const showRegisterForm = (value) => {
  userStore.showLogin = false;
  showRegister.value = value;
}

const showLoginForm = (value) => {
  showRegister.value = false;
  userStore.showLogin = value;
}

// 只设置搜索状态为false，不处理内容过滤
const setIsSearchFalse = () => {
  isSearch.value = false;
}

// 新增：重置搜索状态，并加载默认内容
const resetSearchAndNavigate = () => {
  // 重置搜索数据
  resetSearch();
  // 默认加载Romance类别（或您想要的其他默认类别）
  filterContent("Romance");
}

watch(isLogin, (newValue) => {
  if (newValue) {
    router.push('/Discover');
  }
});

const logout = () => {
  userStore.logout();
  showDrop.value = false;
  router.push('/Discover');
  ElMessage.success('已退出登录');
};

const handleOutsideClick = (event) => {
  if (showDrop.value && !moreButton.value?.contains(event.target)) {
    showDrop.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('click', handleOutsideClick);
  if (route.path !== '/Discover') {
    router.push('/Discover');
  }
  // 如果用户已登录，获取未读消息数
  if (isLogin.value) {
    await conversationStoreInstance.updateTotalUnreadCount(userStore.userThing.id);
  }
});
</script>


<style scoped>
.main-content {
  width: 1177px;
}

.outer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.inner-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}

.Login {
  background-color: white;
  border-radius: 10px;
  width: 400px;
}

.Register {
  background-color: white;
  border-radius: 10px;
  width: 500px;
}

.mainBody-wrapper {
  display: flex;
}

.icon {
  margin-right: 5px;
  margin-bottom: -3px;
  width: 20px;
  height: 20px;
}

.me {
  border-radius: 50%;
}

img {
  width: 100px;
  height: 100px;
}

.navigate {
  display: flex;
  flex-direction: column;
  width: 20%;
  align-items: center;
}

.navigate a {
  text-decoration: none;
  border-radius: 20px;
  color: #333;
}

.navigate a.active {
  background-color: #f0f0f0;
}

.mainBody-wrapper .navigate .login {
  color: #fff;
}

.my-txt {
  border-radius: 20px;
  font-weight: bold;
  padding-left: 10px;
  font-size: 16px;
  display: flex;
  align-items: center;
  height: 48px;
  width: 209px;
  margin-bottom: 5px;
  cursor: pointer;
}

.my-txt.active {
  background-color: #f0f0f0;
}

.login {
  background-color: #ff2e4d;
  font-size: 18.4px;
  display: flex;
  align-items: center;
  height: 48px;
  width: 219px;
  border-radius: 20px;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
}

.more {
  margin-top: 200px;
}

.more:hover {
  background-color: #f0f0f0;
}

.more_pic {
  margin-right: 5px;
  width: 20px;
  height: 20px;
}

.drop-down2 {
  width: 209px;
  background-color: white;
  border-radius: 10px;
  position: absolute;
  padding: 5px;
  border: 1px solid #f0f0f0;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.more-inner {
  font-size: 16px;
  padding: 10px;
  border-radius: 10px;
  color: #888888;
}

.more-inner:hover {
  background-color: #f0f0f0;
}

.my-txt:hover {
  background-color: #f0f0f0;
}

.avatar-skeleton {
  width: 20px;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 50%;
  margin-right: 8px;
}

.icon-wrapper {
  position: relative;
  display: inline-block;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ff2e4d;
  border-radius: 50%;
  z-index: 1;
}
</style>
