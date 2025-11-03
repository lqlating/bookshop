<template>
  <div>
    <Waterfall v-if="articleLists.length > 0" :list="articleLists" :breakpoints="breakpoints" :gutter="25">
      <template #item="{ item }">
        <div class="card" @contextmenu="(event) => $emit('contextmenu', event, item)">
          <div class="image-container" @click="selectArticle(item)">
            <img v-if="item.img" :src="getImageSrc(item.img)" alt="Article Image" 
              class="lazy" loading="lazy" 
              :key="item.article_id + '-img'" />
            <div v-else class="image-placeholder">暂无图片</div>
            <div v-if="item.is_review === 0" class="unreviewed-overlay">
              <span class="unreviewed-text">未审核</span>
            </div>
          </div>
          <p class="text" @click="selectArticle(item)">{{ item.title }}</p>
          <Like_button :item="item" :key="item.article_id + '-like'" />
        </div>
      </template>
    </Waterfall>

    <div v-else class="no-articles">
      没有相应文章
    </div>

    <ArticleInner v-if="selectedArticle" :article="selectedArticle" :article_inner="true" :close="closeArticleInner" />
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { Waterfall } from 'vue-waterfall-plugin-next';
import ArticleInner from '../subArticle/article_inner.vue';
import Like_button from '../subArticle/like_button.vue';

const props = defineProps({
  articleLists: {
    type: Array,
    default: () => []
  }
});

// 定义组件可以发出的事件
defineEmits(['contextmenu']);

const imageLoaded = ref({});
const selectedArticle = ref(null);

const breakpoints = ref({
  1200: { rowPerView: 5 },
  800: { rowPerView: 3 },
  500: { rowPerView: 2 }
});

// 处理图片URL，像商场页面一样直接使用URL路径
const getImageSrc = (img) => {
  if (!img) {
    return '';
  }
  
  // 如果已经是base64格式，跳过（但根据用户要求，应该不使用base64）
  // 这里保留检查，以防数据中仍有base64格式
  if (img.startsWith('data:image')) {
    return img;
  }
  
  // 如果是相对路径且不以 / 或 http 开头，可能需要拼接baseURL
  // 如果已经是完整URL，直接返回
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
    return img;
  }
  
  // 否则可能是相对路径，拼接 /api（根据后端配置）
  return `/api/${img}`;
};

function handleImageLoad(articleId) {
  imageLoaded.value[articleId] = true;
}

function selectArticle(item) {
  if (selectedArticle.value === item) {
    selectedArticle.value = null;
  } else {
    selectedArticle.value = item;
  }
}

function closeArticleInner() {
  selectedArticle.value = null;
}
</script>

<style scoped>
.no-articles {
  margin: 200px;
  text-align: center;
  color: #888;
  font-size: 16px;
  padding: 20px;
}

.image-container {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.lazy {
  width: 100%;
  height: auto;
  border: 0.1px solid rgb(231, 227, 227);
  border-radius: 16px;
  display: block;
  transition: transform 0.3s ease;
  object-fit: cover;
}

.lazy:hover {
  transform: scale(1.05);
}

.lazy::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.lazy:hover::after {
  opacity: 1;
}

.image-placeholder {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #888;
  font-size: 14px;
  border: 0.1px solid rgb(231, 227, 227);
  border-radius: 16px;
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
  border-radius: 16px;
}

.unreviewed-text {
  color: white;
  font-size: 20px;
  font-weight: bold;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
}

.text {
  color: #333333;
  font-size: 14px;
  padding: 0 10px;
  word-break: break-all;
  overflow: hidden;
}

.card {
  position: relative;
}
</style>
