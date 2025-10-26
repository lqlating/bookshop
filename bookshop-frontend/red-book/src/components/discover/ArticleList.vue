<!-- 保持原有的卡片样式和结构 -->
<template>
  <div>
    <Waterfall v-if="articleLists.length > 0" :list="articleLists" :breakpoints="breakpoints" :gutter="25">
      <template #item="{ item }">
        <div class="card" @contextmenu="(event) => $emit('contextmenu', event, item)">
          <div class="image-container" @click="selectArticle(item)">
            <transition name="fade">
              <LazyImg class="lazy" :url="`data:image/png;base64,${item.img_url}`"
                @load="handleImageLoad(item.article_id)" :key="item.article_id + '-img'"
                v-show="imageLoaded[item.article_id]" />
            </transition>
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
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next';
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
  border: 0.1px solid rgb(231, 227, 227);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
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

