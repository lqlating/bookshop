<template>
    <div class="book-item" @click="$emit('click')">
        <div class="book-image-container">
            <img :src="book.image" alt="书籍封面" class="book-image" />
            <div v-if="book.is_selled === 1" class="sold-overlay">
                <span class="sold-text">已卖出</span>
            </div>
            <div v-else-if="book.is_review === 0" class="unreviewed-overlay">
                <span class="unreviewed-text">未审核</span>
            </div>
        </div>
        <div class="book-info">
            <p class="book-title">{{ book.title }}</p>
            <p class="book-author">{{ book.author }}</p>
            <p class="book-price">¥{{ book.price }}</p>
        </div>
    </div>
</template>

<script setup>
import { titleStore } from "../../../store/title";
const titleData = titleStore();

defineProps({
    book: {
        type: Object,
        required: true, // 确保 book 是必传的
    },
});
</script>

<style scoped>
.book-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    overflow: hidden;
    /* 防止内容溢出 */
    height: 100%;
    /* 确保卡片高度充满 */
}

.book-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.book-image-container {
    position: relative;
    width: 100%;
}

.book-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 12px 12px 0 0;
    /* 圆角仅在上方 */
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
    border-radius: 12px 12px 0 0;
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
    border-radius: 12px 12px 0 0;
}

.unreviewed-text {
    color: white;
    font-size: 20px;
    font-weight: bold;
    padding: 8px 16px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
}

.book-info {
    padding: 16px;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    /* 防止 padding 影响宽度 */
    background: white;
    /* 确保背景为白色 */
}

.book-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    /* 确保文字颜色可见 */
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.book-author {
    font-size: 14px;
    color: #666;
    /* 确保文字颜色可见 */
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.book-price {
    font-size: 18px;
    font-weight: bold;
    color: #e74c3c;
    /* 确保文字颜色可见 */
    margin-top: 8px;
}
</style>