<template>
  <div class="book-detail">
    <!-- 左侧书籍封面 -->
    <div class="book-image-container">
      <img :src="`data:image/jpeg;base64,${book.book_img_base64}`" alt="书籍封面" class="book-image" />
    </div>

    <!-- 中间分割线 -->
    <div class="vertical-divider"></div>

    <!-- 右侧商品详情 -->
    <div class="book-info">
      <div class="book-info-block">
        <h2 class="book-title">{{ book.book_title }}</h2>
        <p class="book-author">作者: {{ book.book_writer }}</p>
        <p class="book-price">价格: ¥{{ book.book_price }}</p>
        <p class="book-description">
          {{ book.book_descripe || "这本书暂无详细介绍。" }}
        </p>
      </div>

      <!-- 卖家信息 -->
      <div v-if="isLoading" class="seller-loading">加载卖家信息中...</div>
      <div v-else-if="seller" class="seller-info">
        <div v-if="!seller.avatar_base64" class="avatar-skeleton"></div>
        <div v-else class="avatar-container">
          <img :src="`data:image/jpeg;base64,${seller.avatar_base64}`" alt="卖家头像" class="seller-avatar" />
        </div>
        <p class="seller-name">{{ seller.username }}</p>
      </div>
      <div v-else class="seller-error">获取卖家信息失败</div>
    </div>

    <!-- 关闭按钮 -->
    <button class="close-btn" @click="$emit('close')">✖</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '@/api/axiosInstance'
import userApi from '@/api/modules/userApi'

const props = defineProps({
  book: Object
})

console.log('Book data:', props.book)

const emit = defineEmits(['close'])

const seller = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await userApi.SearchUserById(props.book.book_seller_id)
    console.log('API Response:', response)
    seller.value = response.data.data[0]
  } catch (error) {
    console.error('Failed to fetch seller info:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.book-detail {
  position: relative;
  display: flex;
  width: 800px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  gap: 24px;
}

.book-image-container {
  flex: 0 0 240px;
  height: 320px;
  overflow: hidden;
  border-radius: 8px;
}

.book-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vertical-divider {
  width: 1px;
  background-color: #e0e0e0;
  margin: 0 16px;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-info-block {
  flex: 1;
}

.book-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.book-author {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.book-price {
  font-size: 20px;
  color: #f56c6c;
  font-weight: 600;
  margin-bottom: 16px;
}

.book-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
}

.seller-info {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.seller-loading {
  text-align: center;
  color: #666;
  padding: 12px;
}

.seller-error {
  color: #f56c6c;
  text-align: center;
  padding: 12px;
}

.avatar-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.avatar-skeleton {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eee;
  margin-right: 12px;
}

.seller-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seller-name {
  font-size: 16px;
  color: #333;
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e0e0e0;
  color: #333;
}
</style>
