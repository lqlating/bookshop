<template>
  <div class="virtual-scroll-debug" v-if="showDebug">
    <div class="debug-header">
      <h3>虚拟滚动调试信息</h3>
      <button @click="toggleDebug" class="close-btn">×</button>
    </div>
    
    <div class="debug-content">
      <!-- 基本参数 -->
      <div class="debug-section">
        <h4>基本参数</h4>
        <div class="param-grid">
          <div class="param-item">
            <span class="param-label">总项目数:</span>
            <span class="param-value">{{ totalItems }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">列数:</span>
            <span class="param-value">{{ columnCount }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">每行项目数:</span>
            <span class="param-value">{{ itemsPerRow }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">项目高度:</span>
            <span class="param-value">{{ itemHeight }}px</span>
          </div>
          <div class="param-item">
            <span class="param-label">间距:</span>
            <span class="param-value">{{ gap }}px</span>
          </div>
          <div class="param-item">
            <span class="param-label">缓冲区:</span>
            <span class="param-value">{{ buffer }}</span>
          </div>
        </div>
      </div>

      <!-- 计算参数 -->
      <div class="debug-section">
        <h4>计算参数</h4>
        <div class="param-grid">
          <div class="param-item">
            <span class="param-label">总行数:</span>
            <span class="param-value">{{ totalRows }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">总高度:</span>
            <span class="param-value">{{ totalHeight }}px</span>
          </div>
          <div class="param-item">
            <span class="param-label">每行高度:</span>
            <span class="param-value">{{ rowHeight }}px</span>
          </div>
        </div>
      </div>

      <!-- 滚动状态 -->
      <div class="debug-section">
        <h4>滚动状态</h4>
        <div class="param-grid">
          <div class="param-item">
            <span class="param-label">滚动位置:</span>
            <span class="param-value">{{ scrollTop }}px</span>
          </div>
          <div class="param-item">
            <span class="param-label">容器高度:</span>
            <span class="param-value">{{ containerHeight }}px</span>
          </div>
          <div class="param-item">
            <span class="param-label">滚动高度:</span>
            <span class="param-value">{{ scrollHeight }}px</span>
          </div>
          <div class="param-item">
            <span class="param-label">滚动进度:</span>
            <span class="param-value">{{ scrollProgress }}%</span>
          </div>
        </div>
      </div>

      <!-- 可见范围 -->
      <div class="debug-section">
        <h4>可见范围</h4>
        <div class="param-grid">
          <div class="param-item">
            <span class="param-label">可见行范围:</span>
            <span class="param-value">{{ visibleRowStart }} - {{ visibleRowEnd }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">可见项目数:</span>
            <span class="param-value">{{ visibleItemsCount }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">渲染比例:</span>
            <span class="param-value">{{ renderRatio }}%</span>
          </div>
          <div class="param-item">
            <span class="param-label">Y轴偏移:</span>
            <span class="param-value">{{ offsetY }}px</span>
          </div>
        </div>
      </div>

      <!-- 性能指标 -->
      <div class="debug-section">
        <h4>性能指标</h4>
        <div class="param-grid">
          <div class="param-item">
            <span class="param-label">内存节省:</span>
            <span class="param-value">{{ memorySaved }}%</span>
          </div>
          <div class="param-item">
            <span class="param-label">DOM节点数:</span>
            <span class="param-value">{{ domNodes }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">理论DOM节点:</span>
            <span class="param-value">{{ theoreticalDomNodes }}</span>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div class="debug-section">
        <h4>加载状态</h4>
        <div class="param-grid">
          <div class="param-item">
            <span class="param-label">正在加载:</span>
            <span class="param-value" :class="{ 'loading': isLoading }">
              {{ isLoading ? '是' : '否' }}
            </span>
          </div>
          <div class="param-item">
            <span class="param-label">有更多数据:</span>
            <span class="param-value" :class="{ 'has-more': hasMore }">
              {{ hasMore ? '是' : '否' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalItems: {
    type: Number,
    default: 0
  },
  columnCount: {
    type: Number,
    default: 4
  },
  itemHeight: {
    type: Number,
    default: 500
  },
  gap: {
    type: Number,
    default: 20
  },
  buffer: {
    type: Number,
    default: 5
  },
  scrollTop: {
    type: Number,
    default: 0
  },
  containerHeight: {
    type: Number,
    default: 0
  },
  scrollHeight: {
    type: Number,
    default: 0
  },
  visibleRowStart: {
    type: Number,
    default: 0
  },
  visibleRowEnd: {
    type: Number,
    default: 0
  },
  visibleItemsCount: {
    type: Number,
    default: 0
  },
  offsetY: {
    type: Number,
    default: 0
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  },
  showDebug: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-debug'])

// 计算参数
const itemsPerRow = computed(() => props.columnCount)
const totalRows = computed(() => Math.ceil(props.totalItems / itemsPerRow.value))
const totalHeight = computed(() => {
  if (props.totalItems === 0) return 0
  return totalRows.value * props.itemHeight + (totalRows.value - 1) * props.gap + 40
})
const rowHeight = computed(() => props.itemHeight + props.gap)

// 滚动进度
const scrollProgress = computed(() => {
  if (props.scrollHeight <= props.containerHeight) return 100
  return Math.round((props.scrollTop / (props.scrollHeight - props.containerHeight)) * 100)
})

// 渲染比例
const renderRatio = computed(() => {
  if (props.totalItems === 0) return 0
  return Math.round((props.visibleItemsCount / props.totalItems) * 100)
})

// 内存节省比例
const memorySaved = computed(() => {
  if (props.totalItems === 0) return 0
  return Math.round(((props.totalItems - props.visibleItemsCount) / props.totalItems) * 100)
})

// DOM节点数
const domNodes = computed(() => props.visibleItemsCount)
const theoreticalDomNodes = computed(() => props.totalItems)

const toggleDebug = () => {
  emit('toggle-debug')
}
</script>

<style scoped>
.virtual-scroll-debug {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  z-index: 9999;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
}

.debug-header h3 {
  margin: 0;
  color: #4CAF50;
  font-size: 14px;
}

.close-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.debug-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.debug-section {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 4px;
}

.debug-section h4 {
  margin: 0 0 8px 0;
  color: #2196F3;
  font-size: 13px;
}

.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.param-label {
  color: #ccc;
  font-size: 11px;
}

.param-value {
  color: #fff;
  font-weight: bold;
  font-size: 11px;
}

.param-value.loading {
  color: #FF9800;
}

.param-value.has-more {
  color: #4CAF50;
}

/* 滚动条样式 */
.virtual-scroll-debug::-webkit-scrollbar {
  width: 6px;
}

.virtual-scroll-debug::-webkit-scrollbar-track {
  background: #333;
  border-radius: 3px;
}

.virtual-scroll-debug::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 3px;
}

.virtual-scroll-debug::-webkit-scrollbar-thumb:hover {
  background: #888;
}
</style>
