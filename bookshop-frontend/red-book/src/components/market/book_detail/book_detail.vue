<template>
  <div class="book-detail">
    <!-- 添加举报按钮 - 仅在不是我的书籍时显示 -->
    <el-dropdown v-if="!isMyBooks" trigger="click" class="report-dropdown" teleported>
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

    <!-- 添加举报对话框 -->
    <ReportDialog :is-visible="isReportDialogVisible" content-type="book" :target-id="book.book_id"
      :report-content-id="book.book_id" :reporter-id="user.userThing.id" :extra-data="{ seller_id: book.seller_id }"
      @close="closeReportDialog" />

    <!-- 针对用户的举报对话框 -->
    <ReportDialog :is-visible="isUserReportDialogVisible" content-type="user" :target-id="book.seller_id"
      :report-content-id="book.seller_id" :reporter-id="user.userThing.id" :extra-data="{ from: 'book' }"
      @close="closeUserReportDialog" />

    <!-- 左侧书籍封面 -->
    <div class="book-image-container">
      <img :src="book.image || defaultBookCover" alt="书籍封面" class="book-image" @error="handleImageError" />
      <div v-if="book.is_selled === 1" class="sold-overlay">
        <span class="sold-text">已卖出</span>
      </div>
      <div v-else-if="book.is_review === 0" class="unreviewed-overlay">
        <span class="unreviewed-text">未审核</span>
      </div>
    </div>

    <!-- 中间分割线 -->
    <div class="vertical-divider"></div>

    <!-- 右侧商品详情 -->
    <div class="book-info">
      <div class="book-info-block">
        <h2 class="book-title">{{ book.title }}</h2>
        <p class="book-author">作者: {{ book.author }}</p>
        <p class="book-price">价格: ¥{{ book.price }}</p>
        <p class="book-description">
          {{ book.description || "这本书暂无详细介绍。" }}
        </p>
      </div>

      <!-- 卖家信息 - 仅在不是我的书籍时显示 -->
      <template v-if="!isMyBooks">
        <div v-if="isLoading" class="seller-loading">加载卖家信息中...</div>
        <div v-else-if="seller" class="seller-info">
          <div v-if="!seller.avatar_base64" class="avatar-skeleton"></div>
          <div v-else class="avatar-container">
            <img :src="`data:image/png;base64,${seller.avatar_base64}`" alt="卖家头像" class="seller-avatar"
              @contextmenu.prevent="handleAvatarRightClick" />

            <!-- 简单的自定义右键菜单 -->
            <div v-if="isUserContextMenuVisible" class="custom-menu">
              <div class="menu-item" @click="showUserReportDialog">举报</div>
            </div>
          </div>
          <p class="seller-name">{{ seller.username }}</p>
        </div>
        <div v-else class="seller-error">获取卖家信息失败</div>
      </template>

      <!-- 我的书籍页面提示 -->
      <div v-else class="my-book-info">
        <p>这是您发布的书籍</p>
      </div>

      <!-- 分割线 -->
      <div class="divider"></div>

      <!-- 按钮区域 - 仅在不是我的书籍时显示 -->
      <div v-if="!isMyBooks" class="button-group">
        <!-- 修改联系卖家按钮的点击事件 -->
        <button class="contact-btn" @click="contactSeller" :disabled="book.is_selled === 1">联系卖家</button>
        <button class="cart-btn" @click="addCart(user.userThing.id, book.book_id)"
          :disabled="book.is_selled === 1">加入购物车</button>
      </div>
    </div>

    <!-- 关闭按钮 -->
    <button class="close-btn" @click="$emit('close')">✖</button>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import userApi from "../../../api/userApi";
import { cartStore } from "../../../store/cart";
import { userInfoStore } from "../../../store/user";
import { conversationStore } from "../../../store/conversation";
import { useRouter } from 'vue-router';
import { ElMessage } from "element-plus";
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { MoreFilled } from '@element-plus/icons-vue';
import ReportDialog from '../../report/ReportDialog.vue';
import { messageStore } from "../../../store/message";

// 默认书籍封面
const defaultBookCover = '/src/assets/img/default-book-cover.jpg';

// 接收 book 对象和 isMyBooks 标志
const props = defineProps({
  book: Object,
  isMyBooks: {
    type: Boolean,
    default: false
  }
});

// 使用 store 和 router
const router = useRouter();
const user = userInfoStore();
const cart = cartStore();
const conversationStoreInstance = conversationStore();
const messageStoreInstance = messageStore();

const seller = ref(null);  // 卖家信息
const isLoading = ref(true);  // 加载状态
const error = ref(null);  // 错误信息
const isReportDialogVisible = ref(false);
const isUserReportDialogVisible = ref(false);
const isUserContextMenuVisible = ref(false);

// 联系卖家的函数
const contactSeller = async () => {
  if (!user.isLogin) {
    ElMessage.warning("请先登录！");
    return;
  }

  try {
    // 获取书籍卖家ID
    const sellerId = props.book.seller_id;
    console.log("当前书籍卖家ID:", sellerId);

    // 先获取当前用户的所有会话列表
    await conversationStoreInstance.fetchConversations(user.userThing.id);

    // 打印会话列表用于调试
    console.log("当前会话列表:", JSON.stringify(conversationStoreInstance.conversations, null, 2));

    // 检查聊天列表中是否有卖家ID
    let hasContactedSeller = false;

    // 遍历所有聊天
    for (const conv of conversationStoreInstance.conversations) {
      // 检查用户低ID和高ID是否包含卖家ID
      if (String(conv.user_low_id) === String(sellerId) ||
        String(conv.user_high_id) === String(sellerId)) {
        hasContactedSeller = true;
        break;
      }

      // 如果有target_user信息，也检查一下
      if (conv.target_user && String(conv.target_user.id) === String(sellerId)) {
        hasContactedSeller = true;
        break;
      }
    }

    if (hasContactedSeller) {
      // 如果已经联系过卖家，只显示提示信息
      ElMessage.info("已经联系过该商家");
      return; // 直接返回，不创建新会话也不跳转
    }

    // 如果没有联系过卖家，创建新会话
    const conversation = await conversationStoreInstance.createConversation(
      user.userThing.id,
      sellerId
    );

    // 发送初始消息
    await messageStoreInstance.sendTextMessage(
      conversation.id,
      user.userThing.id,
      "你好"
    );

    // 更新会话的最后一条消息信息
    const updatedConversation = conversationStoreInstance.conversations.find(
      c => c.id === conversation.id
    );
    if (updatedConversation) {
      updatedConversation.last_message = "你好";
      updatedConversation.last_message_type = 'text';
      updatedConversation.last_message_time = new Date().toISOString();
    }

    // 跳转到私聊页面
    router.push('/Notify/privateChat');
    ElMessage.success("已开始私聊");
  } catch (err) {
    console.error("联系卖家失败:", err);
    ElMessage.error("联系卖家失败");
  }
};

// 添加到购物车的函数
const addCart = async (userId, bookId) => {
  if (!user.isLogin) {
    ElMessage.warning("请先登录！");
    return;
  }

  try {
    await cart.addCart(userId, bookId);
    ElMessage.success("已添加到购物车！");
  } catch (err) {
    console.error("添加到购物车失败:", err);
    ElMessage.error("添加到购物车失败！");
  }
};

// 根据 seller_id 获取卖家信息
const fetchSellerInfo = async () => {
  if (props.isMyBooks) {
    isLoading.value = false;
    return;
  }

  try {
    const response = await userApi.SearchUserById(props.book.seller_id);
    if (response.data.code === 1 && response.data.data.length > 0) {
      seller.value = response.data.data[0];
    } else {
      throw new Error("未找到卖家信息");
    }
  } catch (err) {
    console.error("API Error:", err);
    error.value = err.message || "获取卖家信息失败";
  } finally {
    isLoading.value = false;
  }
};

// 组件加载时调用 API
onMounted(() => {
  fetchSellerInfo();
});

const showReportDialog = () => {
  isReportDialogVisible.value = true;
};

const closeReportDialog = () => {
  isReportDialogVisible.value = false;
};

// 处理头像右键点击事件
const handleAvatarRightClick = (event) => {
  event.preventDefault();
  if (!user.isLogin) {
    ElMessage.warning("请先登录！");
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
  if (!user.isLogin) {
    ElMessage.warning("请先登录！");
    return;
  }
  isUserReportDialogVisible.value = true;
  isUserContextMenuVisible.value = false; // 关闭上下文菜单
};

// 关闭针对用户的举报对话框
const closeUserReportDialog = () => {
  isUserReportDialogVisible.value = false;
};

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.src = defaultBookCover;
};
</script>


<style scoped>
/* 整体布局 */
.book-detail {
  display: flex;
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 90%;
  height: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
}

.book-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.book-image {
  width: 100%;
  max-width: 250px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vertical-divider {
  width: 1px;
  background: linear-gradient(to bottom, transparent, #ddd, transparent);
  height: 100%;
}

.book-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.book-info-block {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  overflow-y: auto;
  max-height: calc(100% - 280px);
}

.book-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.book-author,
.book-price {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
}

.book-description {
  font-size: 14px;
  color: #777;
  line-height: 1.6;
  margin: 16px 0 0 0;
  word-break: break-word;
}

.seller-info {
  display: flex;
  align-items: center;
  margin-top: 143px;
}

.my-book-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 143px;
  color: #666;
  font-style: italic;
}

.avatar-skeleton {
  width: 40px;
  height: 40px;
  background-color: #e0e0e0;
  border-radius: 50%;
  margin-right: 12px;
}

.avatar-container {
  position: relative;
  margin-right: 12px;
}

.seller-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: context-menu;
  /* 提示用户这里可以右键 */
}

.seller-name {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.seller-loading {
  font-size: 14px;
  color: #888;
  margin-top: 12px;
}

.divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, #ddd, transparent);
  margin: 16px 0;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 6px;
  margin-bottom: 20px;
}

.contact-btn,
.cart-btn {
  width: 140px;
  height: 40px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-btn {
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
}

.cart-btn {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
  color: white;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.report-dropdown {
  position: absolute;
  top: 167px;
  right: 16px;
  /* 你可以根据需要调整这个值 */
  z-index: 1;
}

.report-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.report-btn:hover {
  color: #333;
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

.sold-overlay {
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

.sold-text {
  color: white;
  font-size: 20px;
  font-weight: bold;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
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

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
