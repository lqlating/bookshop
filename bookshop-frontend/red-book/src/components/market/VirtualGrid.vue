<template>
  <div 
    ref="containerRef" 
    class="virtual-grid-container"
    @scroll="handleScroll"
  >
    <!-- 虚拟容器，用于撑开总高度 -->
    <div 
      class="virtual-spacer" 
      :style="{ height: totalHeight + 'px' }"
    ></div>
    
    <!-- 实际渲染的卡片容器 -->
    <div 
      class="grid-content"
      :style="{ 
        transform: `translateY(${offsetY}px)`,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0
      }"
    >
      <!-- 网格布局 -->
      <div 
        class="grid-items"
        :style="{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: gap + 'px',
          padding: '20px'
        }"
      >
        <div
          v-for="item in visibleItems"
          :key="item.id"
          class="grid-item"
          :ref="el => setItemRef(el, item.originalIndex)"
        >
          <slot :item="item.data" :index="item.originalIndex"></slot>
        </div>
      </div>
    </div>
    
    <!-- 加载指示器 -->
    <div 
      v-if="isLoading" 
      class="loading-indicator"
      :style="{ 
        position: 'absolute',
        top: totalHeight + 'px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '20px'
      }"
    >
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 没有更多数据提示 -->
    <div 
      v-if="!hasMore && items.length > 0" 
      class="no-more-data"
      :style="{ 
        position: 'absolute',
        top: totalHeight + 'px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '20px',
        textAlign: 'center',
        color: '#888',
        fontSize: '14px'
      }"
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
  itemHeight: {
    type: Number,
    default: 500
  },
  buffer: {
    type: Number,
    default: 5
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
const containerWidth = ref(0)
const containerHeight = ref(0)
const scrollTop = ref(0)
const isInitialized = ref(false)

// 计算每行项目数
const itemsPerRow = computed(() => props.columnCount)

// 计算总行数
const totalRows = computed(() => {
  return Math.ceil(props.items.length / itemsPerRow.value)
})

// 计算总高度
const totalHeight = computed(() => {
  if (!isInitialized.value) return props.items.length * props.itemHeight
  return totalRows.value * props.itemHeight + (totalRows.value - 1) * props.gap + 40 // 40px for padding
})

// 计算可见范围
const getVisibleRange = () => {
  const buffer = props.buffer
  const itemHeight = props.itemHeight + props.gap
  const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer)
  const end = Math.min(
    totalRows.value - 1,
    Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + buffer
  )
  
  return { start, end }
}

// 可见项目
const visibleItems = computed(() => {
  if (!isInitialized.value || props.items.length === 0) return []
  
  const { start, end } = getVisibleRange()
  const visibleItems = []
  
  for (let row = start; row <= end; row++) {
    const startIndex = row * itemsPerRow.value
    const endIndex = Math.min(startIndex + itemsPerRow.value, props.items.length)
    
    for (let i = startIndex; i < endIndex; i++) {
      const item = props.items[i]
      if (item) {
        visibleItems.push({
          id: item.id || i,
          data: item,
          originalIndex: i
        })
      }
    }
  }
  
  return visibleItems
})

// 计算偏移量
const offsetY = computed(() => {
  if (!isInitialized.value) return 0
  
  const { start } = getVisibleRange()
  const itemHeight = props.itemHeight + props.gap
  return start * itemHeight
})

// 处理滚动事件
const handleScroll = (event) => {
  scrollTop.value = event.target.scrollTop
  containerHeight.value = event.target.clientHeight
  
  emit('scroll', {
    scrollTop: scrollTop.value,
    scrollHeight: event.target.scrollHeight,
    clientHeight: containerHeight.value
  })
  
  // 检查是否需要加载更多
  const scrollBottom = scrollTop.value + containerHeight.value
  const threshold = totalHeight.value - 200
  
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

// 更新容器尺寸
const updateContainerSize = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
    containerHeight.value = containerRef.value.clientHeight
    nextTick(() => {
      isInitialized.value = true
    })
  }
}

// 监听窗口大小变化
const handleResize = () => {
  updateContainerSize()
}

// 监听items变化
watch(() => props.items, () => {
  nextTick(() => {
    // 可以在这里添加额外的逻辑
  })
}, { deep: true })

onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法给父组件
defineExpose({
  containerRef,
  scrollToTop: () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  },
  scrollToItem: (index) => {
    const row = Math.floor(index / itemsPerRow.value)
    const itemHeight = props.itemHeight + props.gap
    const targetScrollTop = row * itemHeight
    if (containerRef.value) {
      containerRef.value.scrollTop = targetScrollTop
    }
  }
})
</script>

<style scoped>
.virtual-grid-container {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.virtual-grid-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.virtual-spacer {
  width: 100%;
}

.grid-content {
  position: relative;
  width: 100%;
}

.grid-items {
  position: relative;
}

.grid-item {
  height: 500px; /* 固定高度 */
  display: flex;
  flex-direction: column;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

/* 响应式列数 */
@media (min-width: 1200px) {
  .grid-items {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}

@media (min-width: 800px) and (max-width: 1199px) {
  .grid-items {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (min-width: 500px) and (max-width: 799px) {
  .grid-items {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 499px) {
  .grid-items {
    grid-template-columns: repeat(1, 1fr) !important;
  }
}
</style>
