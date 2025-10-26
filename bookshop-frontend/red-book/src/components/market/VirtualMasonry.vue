<template>
  <div 
    ref="containerRef" 
    class="virtual-masonry-container"
    @scroll="handleScroll"
  >
    <!-- 虚拟容器，用于撑开总高度 -->
    <div 
      class="virtual-spacer" 
      :style="{ height: totalHeight + 'px' }"
    ></div>
    
    <!-- 实际渲染的卡片容器 -->
    <div 
      class="masonry-content"
      :style="{ 
        transform: `translateY(${offsetY}px)`,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0
      }"
    >
      <!-- 瀑布流列容器 -->
      <div 
        v-for="(column, columnIndex) in columns" 
        :key="columnIndex"
        class="masonry-column"
        :style="{ 
          width: columnWidth + 'px',
          marginRight: columnIndex < columns.length - 1 ? gap + 'px' : '0',
          position: 'relative'
        }"
      >
        <!-- 渲染该列中的可见卡片 -->
        <div
          v-for="item in column.visibleItems"
          :key="item.id"
          class="masonry-item"
          :style="{ 
            transform: `translateY(${item.offsetY}px)`,
            position: 'absolute',
            width: '100%',
            top: 0
          }"
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
  itemMinHeight: {
    type: Number,
    default: 200
  },
  buffer: {
    type: Number,
    default: 8
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
const itemHeights = ref(new Map())
const containerWidth = ref(0)
const containerHeight = ref(0)
const scrollTop = ref(0)
const isInitialized = ref(false)
const columnHeights = ref([])
const itemPositions = ref(new Map())

// 计算列宽
const columnWidth = computed(() => {
  if (containerWidth.value === 0) return 0
  return (containerWidth.value - (props.gap * (props.columnCount - 1))) / props.columnCount
})

// 初始化列高度
const initColumnHeights = () => {
  columnHeights.value = Array.from({ length: props.columnCount }, () => 0)
}

// 计算所有项目的位置（只在items变化时计算一次）
const calculateItemPositions = () => {
  if (!isInitialized.value || props.items.length === 0) return
  
  try {
    initColumnHeights()
    itemPositions.value.clear()
    
    props.items.forEach((item, index) => {
      const itemHeight = itemHeights.value.get(item.id || index) || props.itemMinHeight
      const shortestColumnIndex = columnHeights.value.indexOf(Math.min(...columnHeights.value))
      
      // 确保 columnIndex 在有效范围内
      const validColumnIndex = Math.max(0, Math.min(shortestColumnIndex, props.columnCount - 1))
      
      const position = {
        id: item.id || index,
        data: item,
        originalIndex: index,
        height: itemHeight,
        offsetY: columnHeights.value[validColumnIndex],
        columnIndex: validColumnIndex
      }
      
      itemPositions.value.set(item.id || index, position)
      columnHeights.value[validColumnIndex] += itemHeight + props.gap
    })
  } catch (error) {
    console.error('Error calculating item positions:', error)
  }
}

// 计算每列的高度和可见项目
const columns = computed(() => {
  if (!isInitialized.value || props.items.length === 0) {
    return Array.from({ length: props.columnCount }, () => ({
      height: 0,
      items: [],
      visibleItems: []
    }))
  }

  try {
    // 计算可见范围
    const visibleRange = getVisibleRange()
    
    // 从预计算的位置中获取可见项目
    const cols = Array.from({ length: props.columnCount }, () => ({
      height: 0,
      items: [],
      visibleItems: []
    }))
    
    // 将所有项目分配到对应列
    itemPositions.value.forEach((position) => {
      if (position && 
          position.columnIndex !== undefined && 
          position.columnIndex >= 0 && 
          position.columnIndex < cols.length) {
        const col = cols[position.columnIndex]
        if (col) {
          col.items.push(position)
          col.height = Math.max(col.height, position.offsetY + position.height)
        }
      }
    })
    
    // 过滤可见项目
    cols.forEach(col => {
      col.visibleItems = col.items.filter(item => 
        item && item.originalIndex !== undefined &&
        item.originalIndex >= visibleRange.start && 
        item.originalIndex <= visibleRange.end
      )
    })
    
    return cols
  } catch (error) {
    console.error('Error in columns computed:', error)
    return Array.from({ length: props.columnCount }, () => ({
      height: 0,
      items: [],
      visibleItems: []
    }))
  }
})

// 计算总高度
const totalHeight = computed(() => {
  if (!isInitialized.value) return props.items.length * props.itemMinHeight
  return Math.max(...columnHeights.value, props.items.length * props.itemMinHeight)
})

// 计算偏移量
const offsetY = computed(() => {
  if (!isInitialized.value) return 0
  
  const visibleRange = getVisibleRange()
  let minOffset = Infinity
  
  columns.value.forEach(col => {
    col.visibleItems.forEach(item => {
      if (item.originalIndex >= visibleRange.start && item.originalIndex <= visibleRange.end) {
        minOffset = Math.min(minOffset, item.offsetY)
      }
    })
  })
  
  return minOffset === Infinity ? 0 : Math.max(0, minOffset - props.gap)
})

// 获取可见范围
const getVisibleRange = () => {
  try {
    const buffer = props.buffer
    const itemHeight = props.itemMinHeight
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer)
    const end = Math.min(
      Math.max(0, props.items.length - 1),
      Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + buffer
    )
    
    return { start, end }
  } catch (error) {
    console.error('Error calculating visible range:', error)
    return { start: 0, end: Math.max(0, props.items.length - 1) }
  }
}

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
    // 测量高度
    nextTick(() => {
      measureItemHeight(el, index)
    })
  }
}

// 测量项目高度
const measureItemHeight = (element, index) => {
  if (!element || !props.items[index]) return
  
  try {
    const height = element.offsetHeight
    const item = props.items[index]
    const itemId = item.id || index
    const currentHeight = itemHeights.value.get(itemId)
    
    // 只有当高度真正改变时才重新计算
    if (currentHeight !== height && height > 0) {
      itemHeights.value.set(itemId, height)
      // 延迟重新计算位置，避免频繁更新
      nextTick(() => {
        calculateItemPositions()
      })
    }
  } catch (error) {
    console.error('Error measuring item height:', error)
  }
}

// 更新容器尺寸
const updateContainerSize = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
    containerHeight.value = containerRef.value.clientHeight
    // 延迟初始化，确保容器完全渲染
    nextTick(() => {
      isInitialized.value = true
      calculateItemPositions()
    })
  }
}

// 监听窗口大小变化
const handleResize = () => {
  updateContainerSize()
}

// 监听items变化，重新计算位置
watch(() => props.items, () => {
  nextTick(() => {
    calculateItemPositions()
    // 重新测量所有可见项目的高度
    itemRefs.value.forEach((element, index) => {
      if (element) {
        measureItemHeight(element, index)
      }
    })
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
    const item = props.items[index]
    if (item) {
      const itemHeight = itemHeights.value.get(item.id || index) || props.itemMinHeight
      const targetScrollTop = index * itemHeight
      if (containerRef.value) {
        containerRef.value.scrollTop = targetScrollTop
      }
    }
  }
})
</script>

<style scoped>
.virtual-masonry-container {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.virtual-masonry-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.virtual-spacer {
  width: 100%;
}

.masonry-content {
  position: relative;
  width: 100%;
}

.masonry-column {
  position: relative;
  display: inline-block;
  vertical-align: top;
}

.masonry-item {
  position: absolute;
  width: 100%;
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
</style>