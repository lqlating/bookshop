<template>
  <div class="book-detail-modal">
    <div class="modal-header">
      <button class="close-button" @click="$emit('close')">×</button>
    </div>
    
    <div class="modal-content">
      <!-- 加载状态 -->
      <div v-if="book.isLoading" class="loading-seller">
        <p>加载中...</p>
      </div>
      
      <!-- 骨架屏样式 -->
      <div v-else-if="book.isLoading && !book.sellerInfo" class="skeleton-loader">
        <div class="skeleton-image"></div>
        <div class="skeleton-info">
          <div class="skeleton-line title-line"></div>
          <div class="skeleton-line author-line"></div>
          <div class="skeleton-line price-line"></div>
          <div class="skeleton-line description-line"></div>
          <div class="skeleton-avatar"></div>
          <div class="skeleton-line seller-name-line"></div>
        </div>
      </div>

      <!-- 书籍封面和信息 -->
      <div v-else class="book-cover-info">
        <div class="book-cover">
          <img :src="book.image" alt="book cover" />
        </div>
        
        <div class="book-info">
          <h2>{{ book.title }}</h2>
          <p>作者: {{ book.author }}</p>
          <p>价格: ¥{{ book.price }}</p>
          <p>{{ book.description }}</p>
          
          <!-- 卖家信息 -->
          <div v-if="book.sellerInfo" class="seller-info">
            <div class="seller-avatar">
              <img :src="book.sellerInfo.avatar" alt="seller avatar" />
            </div>
            <div class="seller-name">{{ book.sellerInfo.name }}</div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="contact-seller-btn">联系卖家</button>
        <button class="add-to-cart-btn">加入购物车</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookDetail',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  emits: ['close']
}
</script>

<style scoped>
/* 整体布局 */
.book-detail-modal {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 90%;
  height: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.modal-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.loading-seller {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 骨架屏样式 */
.skeleton-loader {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.skeleton-image {
  width: 200px;
  height: 300px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-info {
  flex: 1;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: loading 1.5s infinite;
  margin-bottom: 10px;
}

.title-line {
  width: 80%;
}

.author-line {
  width: 60%;
}

.price-line {
  width: 40%;
}

.description-line {
  width: 90%;
  height: 40px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  margin-top: 20px;
}

.seller-name-line {
  width: 50%;
  height: 16px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.book-cover-info {
  display: flex;
  gap: 20px;
}

.book-cover {
  width: 200px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  flex: 1;
}

.book-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.book-info p {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
}

.seller-info {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.seller-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-right: 12px;
}

.seller-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seller-name {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.contact-seller-btn,
.add-to-cart-btn {
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

.contact-seller-btn {
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
}

.add-to-cart-btn {
  background: linear-gradient(135deg, #ff416c, #ff4b2b);
  color: white;
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
