<template>
  <div class="cart-container">
    <div class="cart-content">
      <div class="cart-left">
        <!-- 头部，全选 + 删除 -->
        <div class="cart-header">
          <div class="header-left">
            <input type="checkbox" v-model="selectAll" class="checkbox" :disabled="cartLists.length === 0" />
            <span>全选</span>
          </div>
          <button class="delete-btn" @click="removeSelectedItems" :disabled="cartLists.length === 0">删除</button>
        </div>

        <!-- 购物车商品列表 -->
        <div class="cart-list" ref="cartList">
          <template v-if="cartLists.length > 0">
            <Card v-for="(item, index) in cartLists" :key="item.cart_id" v-model:selected="cartLists[index].selected"
              :image="getImageSrc(item.book.book_img || item.book.book_img_base64)" :title="item.book.book_title"
              :author="item.book.book_writer" :price="item.book.book_price" @remove-item="removeItem(item.cart_id)" />
          </template>
          <template v-else>
            <div class="empty-cart">
              <img src="@/assets/img/empty-cart.png" alt="购物车为空" class="empty-cart-image" />
              <p class="empty-cart-text">购物车空空如也，快去挑选商品吧！</p>
            </div>
          </template>
        </div>

        <!-- 回顶部按钮 -->
        <button v-if="showBackToTop" class="back-to-top" @click="scrollToTop"></button>
      </div>

      <!-- 结算框 -->
      <div class="checkout-box">
        <p>合计: ￥{{ totalPrice }}</p>
        <div class="checkout-items">
          <div class="item" v-for="(item, index) in visibleItems" :key="index" @mouseenter="hoverItemIndex = index"
            @mouseleave="hoverItemIndex = null">
            <div class="item-image-wrapper">
              <img :src="getImageSrc(item.book.book_img || item.book.book_img_base64)" alt="书籍封面" class="item-image"
                :class="{ 'image-hover': hoverItemIndex === index }" />
              <button v-if="hoverItemIndex === index" class="remove-item-btn" @click="removeFromCheckout(item)">
                ×
              </button>
            </div>
          </div>
        </div>
        <button v-if="selectedItems.length > 6" @click="toggleShowMore" class="show-more-btn">
          {{ showMore ? "收起" : "展开全部商品" }} <span>{{ showMore ? "▲" : "▼" }}</span>
        </button>
        <button class="checkout-btn" :disabled="selectedItems.length === 0" @click="handleCheckout">结算</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from 'pinia';
import Card from "./card/card.vue";
import { cartStore } from "@/store/cart";
import { userInfoStore } from "@/store/user";
import { useTransactionStore } from "@/store/transaction";
import { ElMessage } from 'element-plus';

// 使用 storeToRefs 保持响应式
const store = cartStore();
const userStore = userInfoStore();
const transactionStore = useTransactionStore();
const { cartLists } = storeToRefs(store);
const { fetchCartsByOwnerId, deleteCart, deleteCarts } = store;

// 从 userStore 中获取用户 ID
const currentUserId = userStore.userThing.id;

// 处理图片路径，判断是否为base64格式
const getImageSrc = (image) => {
  if (!image) {
    return 'https://via.placeholder.com/50'; // 返回默认图片
  }

  // 检查是否已经是完整的base64字符串（包含前缀）
  if (image.startsWith('data:image')) {
    return image;
  }

  // 检查是否是base64编码但没有前缀
  // 更严格的base64检测正则表达式
  if (/^[A-Za-z0-9+/=]+$/.test(image) && image.length > 20) {
    return `data:image/jpeg;base64,${image}`;
  }

  // 否则返回原始图片路径
  return image;
};

// 初始化时添加selected属性
onMounted(async () => {
  await fetchCartsByOwnerId(currentUserId);
  // 为每个购物车项添加selected属性
  cartLists.value.forEach(item => {
    if (item.selected === undefined) {
      item.selected = false;
    }
  });
});

// 计算选中的商品
const selectedItems = computed(() => cartLists.value.filter(item => item.selected));

// 计算总价
const totalPrice = computed(() => selectedItems.value.reduce((sum, item) => sum + item.book.book_price, 0));

// 全选逻辑
const selectAll = computed({
  get: () => cartLists.value.length > 0 && cartLists.value.every(item => item.selected),
  set: (value) => {
    cartLists.value.forEach(item => {
      item.selected = value;
    });
  },
});

// 删除单个商品
const removeItem = (cartId) => {
  deleteCart(currentUserId, cartId);
};

// 删除选中的商品
const removeSelectedItems = () => {
  const selectedCartIds = selectedItems.value.map(item => item.cart_id);
  if (selectedCartIds.length > 0) {
    deleteCarts(currentUserId, selectedCartIds);
  }
};

// 展开/收起逻辑
const showMore = ref(false);
const visibleItems = computed(() =>
  showMore.value ? selectedItems.value : selectedItems.value.slice(0, 6)
);

const toggleShowMore = () => {
  showMore.value = !showMore.value;
};

// 回到顶部逻辑
const cartList = ref(null);
const showBackToTop = ref(false); // 控制回顶部按钮的显示

const scrollToTop = () => {
  if (cartList.value) {
    cartList.value.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// 监听滚动事件，判断是否需要显示回顶部按钮
onMounted(() => {
  if (cartList.value) {
    cartList.value.addEventListener('scroll', () => {
      showBackToTop.value = cartList.value.scrollTop > 100; // 当滚动超过100px时显示按钮
    });
  }
});

// 鼠标悬停的索引
const hoverItemIndex = ref(null);

// 从结算框中移除商品
const removeFromCheckout = (item) => {
  item.selected = false; // 取消选中状态
};

// 添加结算方法
const handleCheckout = async () => {
  if (selectedItems.value.length === 0) {
    return;
  }

  try {
    // 为每个选中的商品创建交易申请
    for (const item of selectedItems.value) {
      const sellerId = item.book.seller_id || item.book.book_seller_id || item.book.owner_id;
      const bookId = item.book.book_id;

      // 创建交易申请
      await transactionStore.createTransaction({
        bookId,
        buyerId: currentUserId,
        sellerId
      });
    }

    // 删除所有选中的购物车项
    const cartIds = selectedItems.value.map(item => item.cart_id);
    await deleteCarts(currentUserId, cartIds);

    // 通过修改原始数据来取消选中，而不是直接修改计算属性
    cartLists.value.forEach(item => {
      item.selected = false;
    });

    ElMessage.success(`成功结算 ${cartIds.length} 件商品`);

    // 重新获取购物车列表
    await fetchCartsByOwnerId(currentUserId);
  } catch (error) {
    console.log('Processing checkout...');
  }
};
</script>

<style scoped>
.cart-container {
  display: flex;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
}

.cart-content {
  display: flex;
  gap: 30px;
  /* 增加间距 */
}

.cart-left {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: auto;
  /* 去掉固定宽度，自动适应内容 */
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  box-sizing: border-box;
  border: 1px solid #ddd;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox {
  transform: scale(1.2);
  cursor: pointer;
}

.delete-btn {
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:disabled {
  color: #ccc;
  /* 按钮颜色暗淡 */
  cursor: not-allowed;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 480px;
  /* 减小最大高度 */
  overflow-y: auto;
  scrollbar-width: none;
  border-radius: 8px;
}

.checkout-box {
  width: 250px;
  max-height: 400px;
  /* 限制结算框的最大高度，与列表保持一致 */
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  margin-left: 30px;
  /* 增加左边距，让结算框更远离商品列表 */
}

.checkout-box p {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.checkout-btn {
  background: #ff2e4d;
  color: #fff;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  width: 100%;
  margin-top: 15px;
}

.checkout-btn:disabled {
  background: #ccc;
  /* 按钮颜色暗淡 */
  cursor: not-allowed;
}

.checkout-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
  max-height: 250px;
  /* 给结算框中的商品列表一个最大高度 */
  overflow-y: auto;
  scrollbar-width: none;
  /* 隐藏滚动条 */
}

.checkout-items::-webkit-scrollbar {
  display: none;
}

.item {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}

.item-image-wrapper {
  position: relative;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  transition: opacity 0.3s;
}

.image-hover {
  opacity: 0.7;
  /* 图片阴翳效果 */
}

.remove-item-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: transparent;
  /* 背景透明 */
  color: #999;
  /* 颜色改为淡灰 */
  border: none;
  border-radius: 0;
  /* 去掉圆角 */
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}


.show-more-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.show-more-btn span {
  margin-left: 5px;
  font-size: 14px;
}

.back-to-top {
  position: fixed;
  right: 430px;
  bottom: 90px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.back-to-top:hover {
  opacity: 1;
}

.back-to-top::before {
  content: "";
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid white;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.empty-cart-image {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}

.empty-cart-text {
  font-size: 16px;
  color: #888;
}
</style>