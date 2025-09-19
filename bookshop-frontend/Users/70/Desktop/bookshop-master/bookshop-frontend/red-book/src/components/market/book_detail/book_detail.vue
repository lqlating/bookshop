<template>
  <div class="book-detail-modal">
    <div class="modal-header">
      <button class="close-button" @click="$emit('close')">×</button>
    </div>
    
    <div class="modal-content">
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
        
        <!-- 加载状态 -->
        <div v-else-if="book.isLoading" class="loading-seller">
          <p>加载卖家信息中...</p>
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
.book-detail-modal {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.modal-content {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.book-cover {
  flex: 1;
}

.book-cover img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.book-info {
  flex: 2;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.book-info h2 {
  margin: 0 0 10px;
  color: #333;
}

.book-info p {
  margin: 5px 0;
  color: #666;
}

.seller-info {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.seller-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.seller-name {
  font-weight: bold;
  color: #333;
}

.loading-seller {
  margin-top: 20px;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.contact-seller-btn,
.add-to-cart-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.contact-seller-btn {
  background-color: #3498db;
  color: white;
}

.add-to-cart-btn {
  background-color: #e74c3c;
  color: white;
}
</style>