<template>
  <div 
    ref="containerRef" 
    class="masonry-container"
    @scroll="handleScroll"
  >
    <!-- 瀑布流布局 -->
    <div 
      class="masonry-grid"
      :style="{ 
        columnCount: columnCount,
        columnGap: gap + 'px',
        padding: '20px'
      }"
    >
      <div
        v-for="(item, index) in items"
        :key="item.id || index"
        class="masonry-item"
        :ref="el => setItemRef(el, index)"
      >
        <slot :item="item" :index="index"></slot>
      </div>
    </div>
    
    <!-- 加载指示器 -->
    <div 
      v-if="isLoading" 
      class="loading-indicator"
    >
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 没有更多数据提示 -->
    <div 
      v-if="!hasMore && items.length > 0" 
      class="no-more-data"
    >
      没有更多书籍了
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  columnCount: {
    type: Number,
    default: 4
  },
  gap: {
    type: Number,
    default: 20
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['load-more', 'scroll'])

const containerRef = ref(null)
const itemRefs = ref([])

// 处理滚动事件
const handleScroll = (event) => {
  const scrollTop = event.target.scrollTop
  const scrollHeight = event.target.scrollHeight
  const clientHeight = event.target.clientHeight
  
  emit('scroll', {
    scrollTop,
    scrollHeight,
    clientHeight
  })
  
  // 检查是否需要加载更多
  const scrollBottom = scrollTop + clientHeight
  const threshold = scrollHeight - 200
  
  if (scrollBottom >= threshold && props.hasMore && !props.isLoading) {
    emit('load-more')
  }
}

// 设置项目引用
const setItemRef = (el, index) => {
  if (el) {
    itemRefs.value[index] = el
  }
}

// 监听items变化
watch(() => props.items, () => {
  nextTick(() => {
    // 可以在这里添加额外的逻辑
  })
}, { deep: true })

onMounted(() => {
  // 初始化逻辑
})

onUnmounted(() => {
  // 清理逻辑
})

// 暴露方法给父组件
defineExpose({
  containerRef,
  scrollToTop: () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  }
})
</script>

<style scoped>
.masonry-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.masonry-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.masonry-grid {
  position: relative;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 20px;
  display: inline-block;
  width: 100%;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-indicator p {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.no-more-data {
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 14px;
}

/* 响应式列数 */
@media (min-width: 1200px) {
  .masonry-grid {
    column-count: 4;
  }
}

@media (min-width: 800px) and (max-width: 1199px) {
  .masonry-grid {
    column-count: 3;
  }
}

@media (min-width: 500px) and (max-width: 799px) {
  .masonry-grid {
    column-count: 2;
  }
}

@media (max-width: 499px) {
  .masonry-grid {
    column-count: 1;
  }
}
</style>

