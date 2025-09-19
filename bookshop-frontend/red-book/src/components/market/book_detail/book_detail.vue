<template>
  <div class="book-detail">
    <!-- 左侧书籍封面 -->
    <div class="book-image-container">
      <img :src="book.image || defaultBookCover" alt="书籍封面" class="book-image" @error="handleImageError" />
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

      <!-- 卖家信息 -->
      <div v-if="isLoading" class="seller-loading">加载卖家信息中...</div>
      <div v-else-if="seller" class="seller-info">
        <div class="avatar-container">
          <img :src="`data:image/png;base64,${seller.avatar_base64}`" alt="卖家头像" class="seller-avatar" />
        </div>
        <p class="seller-name">{{ seller.username }}</p>
      </div>
      <div v-else class="seller-error">获取卖家信息失败</div>

      <!-- 分割线 -->
      <div class="divider"></div>

      <!-- 按钮区域 -->
      <div class="button-group">
        <button class="contact-btn" @click="contactSeller">联系卖家</button>
        <button class="cart-btn" @click="addCart">加入购物车</button>
      </div>
    </div>

    <!-- 关闭按钮 -->
    <button class="close-btn" @click="$emit('close')">✖</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import userApi from "../../../api/userApi";
import { cartStore } from "../../../store/cart";
import { userInfoStore } from "../../../store/user";
import { ElMessage } from "element-plus";

// 默认书籍封面
const defaultBookCover = '/src/assets/img/default-book-cover.jpg';

// 接收 book 对象
const props = defineProps({
  book: Object
});

const emit = defineEmits(['close']);

// 使用 store
const user = userInfoStore();
const cart = cartStore();

const seller = ref(null);  // 卖家信息
const isLoading = ref(true);  // 加载状态

// 图片加载失败时的处理
const handleImageError = (event) => {
  event.target.src = defaultBookCover;
};

// 获取卖家信息
const fetchSellerInfo = async (sellerId) => {
  try {
    isLoading.value = true;
    const res = await userApi.SearchUserById(sellerId);
    seller.value = res.data.data;
  } catch (error) {
    console.error("获取卖家信息失败:", error);
    seller.value = null;
  } finally {
    isLoading.value = false;
  }
};

// 联系卖家
const contactSeller = () => {
  // 这里可以实现联系卖家的逻辑
  ElMessage.info("联系卖家功能");
};

// 加入购物车
const addCart = () => {
  // 这里可以实现加入购物车的逻辑
  ElMessage.info("加入购物车功能");
};

// 监听书籍属性变化
watch(() => props.book, (newBook) => {
  if (newBook) {
    // 如果书籍信息中已经包含卖家信息，则直接使用
    if (newBook.sellerInfo) {
      seller.value = newBook.sellerInfo;
      isLoading.value = false;
    } 
    // 否则通过API获取卖家信息
    else if (newBook.seller_id) {
      fetchSellerInfo(newBook.seller_id);
    } 
    // 如果没有卖家ID，则直接完成加载
    else {
      isLoading.value = false;
    }
  }
}, { immediate: true });

// 在组件挂载时获取卖家信息（作为后备方案）
onMounted(async () => {
  if (props.book && props.book.seller_id && !seller.value) {
    await fetchSellerInfo(props.book.seller_id);
  } else if (!props.book || !props.book.seller_id) {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.book-detail {
  display: flex;
  background: white;
  border-radius: 16px;
  width: 800px;
  height: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
}

.book-image-container {
  width: 300px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.book-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.vertical-divider {
  width: 1px;
  height: calc(100% - 40px);
  background: linear-gradient(to bottom, transparent, #ddd, transparent);
  margin: 20px 0;
}

.book-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.book-info-block {
  flex: 1;
}

.book-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.book-author {
  font-size: 16px;
  color: #666;
  margin: 8px 0;
}

.book-price {
  font-size: 20px;
  color: #e74c3c;
  font-weight: 700;
  margin: 8px 0;
}

.book-description {
  font-size: 14px;
  color: #666;
  margin: 16px 0;
  line-height: 1.5;
  flex: 1;
}

.seller-info {
  display: flex;
  align-items: center;
  margin-top: 12px;
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
}

.seller-name {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.seller-loading,
.seller-error {
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