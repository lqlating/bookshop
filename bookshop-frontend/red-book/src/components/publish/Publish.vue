<template>
  <!-- 切换按钮放在框外 -->
  <div class="toggle-btn-wrapper">
    <el-switch v-model="isBookPublish" :active-text="'发布书籍'" :inactive-text="'发布文章'" active-color="#ff2e4d"
      inactive-color="#dcdfe6" @change="togglePublishType" class="switch-btn" />
  </div>

  <!-- 表单容器 -->
  <div class="publish-wrapper">
    <!-- 标题部分 -->
    <h1 ref="titleRef" class="publish-title">{{ isBookPublish ? '发布书籍' : '发布文章' }}</h1>

    <!-- 表单内容 -->
    <form @submit.prevent="submitContent" class="publish-form">
      <div class="form-group">
        <label for="title">{{ isBookPublish ? '书籍名' : '标题' }}</label>
        <input v-model="form.title" type="text" id="title" placeholder="请输入内容标题" required />
      </div>

      <div class="form-group" v-if="isBookPublish">
        <label for="author">书籍作者</label>
        <input v-model="form.author" type="text" id="author" placeholder="请输入书籍作者" required />
      </div>

      <!-- 文章分类下拉框移动到书籍图片上方 -->
      <div class="form-group" v-if="!isBookPublish">
        <label for="category">文章分类</label>
        <select v-model="form.category" id="category" required>
          <option value="" disabled selected>请输入文章分类</option> <!-- 添加默认空选项 -->
          <option v-for="title in titleList" :key="title.id" :value="title.value">{{ title.title }}</option>
        </select>
      </div>

      <div class="form-group" v-if="isBookPublish">
        <label for="category">书籍分类</label>
        <select v-model="form.category" id="category" required>
          <option value="" disabled selected>请输入书籍分类</option> <!-- 添加默认空选项 -->
          <option v-for="title in titleList" :key="title.id" :value="title.value">{{ title.title }}</option>
        </select>
      </div>

      <div class="form-group" v-if="isBookPublish">
        <label for="price">书本售价</label>
        <input v-model="form.price" type="number" id="price" placeholder="请输入书本售价" required />
      </div>

      <!-- 书籍封面图片上传 -->
      <div class="form-group">
        <label for="image">选择书籍封面图片</label>
        <div class="image-upload" v-if="!form.bookImagePreview" @click="triggerFileInput" @dragover.prevent
          @drop.prevent="handleFileDrop">
          <input type="file" id="bookImage" @change="handleImageUpload" accept="image/*" required ref="fileInput" />
          <div class="upload-area">
            <span class="upload-icon">+</span>
            <span class="upload-text">点击或拖拽文件上传</span>
          </div>
        </div>

        <div class="uploaded-image" v-if="form.bookImagePreview">
          <img :src="form.bookImagePreview" alt="Image Preview" class="image-preview" />
          <button class="remove-image" @click="clearImage">×</button>
        </div>
      </div>

      <div class="form-group">
        <label for="content">{{ isBookPublish ? '书籍简介' : '文章内容' }}</label>
        <textarea v-model="form.content" id="content" placeholder="请输入内容" rows="4" required></textarea>
      </div>

      <button type="submit" class="publish-button">{{ isBookPublish ? '发布书籍' : '发布文章' }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { userInfoStore } from '../../store/user';
import { ElMessage } from 'element-plus';
import articleApi from '../../api/articleApi';
import bookApi from '../../api/bookApi'; // 添加书籍 API 导入
import { titleStore } from '../../store/title';
import { storeToRefs } from 'pinia'; // 添加 storeToRefs 导入
import gsap from 'gsap'; // 引入 GSAP 库
import { containsDirtyWords, filterDirtyWords } from '../../utils/formValidation'; // 导入脏话过滤工具

const userStore = userInfoStore();
const titleStoreInstance = titleStore(); // 获取 titleStore 实例
const { titleList } = storeToRefs(titleStoreInstance); // 使用 storeToRefs 确保 titleList 的响应性
const isBookPublish = ref(false); // 切换发布类型

const form = ref({
  title: '',
  author: '',
  category: '',
  price: '',
  bookImage: null,
  bookImagePreview: '',
  content: '',
});
const titleRef = ref(null); // 标题的 DOM 引用
const fileInput = ref(null); // 添加 fileInput 的引用

// 获取标题列表
titleStoreInstance.fetchAllTitles();

// 切换发布类型
const togglePublishType = () => {
  resetForm(); // 切换时重置表单数据
};

// 监听 isBookPublish 变化，触发标题动画
watch(isBookPublish, () => {
  if (titleRef.value) {
    gsap.fromTo(
      titleRef.value,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }
});

// 处理书籍封面图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result.split(',')[1]; // 获取 Base64 编码部分
      form.value.bookImagePreview = e.target.result;
      form.value.bookImage = base64Image; // 存储 Base64 图片
    };
    reader.readAsDataURL(file);
  }
};

// 处理文件拖放
const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result.split(',')[1]; // 获取 Base64 编码部分
      form.value.bookImagePreview = e.target.result;
      form.value.bookImage = base64Image; // 存储 Base64 图片
    };
    reader.readAsDataURL(file);
  }
};

// 点击触发文件输入
const triggerFileInput = () => {
  fileInput.value.click(); // 使用 fileInput 的引用
};

// 清除已上传的书籍封面图片
const clearImage = () => {
  form.value.bookImage = null;
  form.value.bookImagePreview = '';
};

// 重置表单
const resetForm = () => {
  form.value.title = '';
  form.value.author = '';
  form.value.category = '';
  form.value.price = '';
  form.value.bookImage = null;
  form.value.bookImagePreview = '';
  form.value.content = '';
};

// 提交书籍或文章
const submitContent = async () => {
  if (!form.value.title || !form.value.content || !form.value.category || !form.value.bookImage) {
    ElMessage({
      message: '请填写所有必填项',
      type: 'warning',
    });
    return;
  }

  if (isBookPublish.value && (!form.value.author || !form.value.price)) {
    ElMessage({
      message: '请填写所有书籍相关信息',
      type: 'warning',
    });
    return;
  }

  // 检查标题和内容是否包含脏话
  if (containsDirtyWords(form.value.title)) {
    ElMessage.error('标题包含不适当的内容，请修改后再发布');
    return;
  }

  if (containsDirtyWords(form.value.content)) {
    ElMessage.error('内容包含不适当的内容，请修改后再发布');
    return;
  }

  // 如果是书籍发布，还需要检查作者名字
  if (isBookPublish.value && containsDirtyWords(form.value.author)) {
    ElMessage.error('作者名称包含不适当的内容，请修改后再发布');
    return;
  }

  const formData = new FormData();
  try {
    if (isBookPublish.value) {
      formData.append('book_title', form.value.title);
      formData.append('book_writer', form.value.author);
      formData.append('book_type', form.value.category);
      formData.append('book_price', form.value.price);
      formData.append('book_descripe', form.value.content); // 修改为 book_descripe
      formData.append('book_seller_id', userStore.userThing.id);

      if (form.value.bookImage) {
        formData.append('book_img_base64', form.value.bookImage); // 将 Base64 图片数据作为字符串发送
      }

      // 打印发布书籍的数据
      console.log('发布书籍数据:', {
        book_title: form.value.title,
        book_writer: form.value.author,
        book_type: form.value.category,
        book_price: form.value.price,
        book_descripe: form.value.content,
        book_seller_id: userStore.userThing.id,
        book_img_base64: '已上传图片(Base64)'
      });

      await bookApi.addBook(formData);
    } else {
      formData.append('title', form.value.title);
      formData.append('txtType', form.value.category);
      formData.append('content', form.value.content);
      formData.append('authorId', userStore.userThing.id);

      if (form.value.bookImage) {
        formData.append('img', form.value.bookImage); // 将 Base64 图片数据作为字符串发送
      }

      // 打印发布文章的数据
      console.log('发布文章数据:', {
        title: form.value.title,
        txtType: form.value.category,
        content: form.value.content,
        authorId: userStore.userThing.id,
        img: form.value.bookImage ? '已上传图片(Base64)' : null
      });

      await articleApi.addArticle(formData);
    }

    ElMessage({
      message: isBookPublish.value ? '书籍发布成功！' : '文章发布成功！',
      type: 'success',
    });

    resetForm();
  } catch (error) {
    console.error('发布失败:', error);
    ElMessage({
      message: '发布失败，请重试',
      type: 'error',
    });
  }
};
</script>


<style scoped>
.toggle-btn-wrapper {
  margin-left: 435px;
  margin-bottom: 5px;
  /* 减少切换按钮与表单之间的距离 */
}

.switch-btn {
  --el-switch-on-color: #ff2e4d;
  --el-switch-off-color: #dcdfe6;
}

/* 始终保持文字颜色为主题红色 */
.switch-btn .el-switch__label {
  color: #ff2e4d !important;
  font-weight: bold;
}

.publish-wrapper {
  background-color: white;
  padding: 8px;
  margin-left: 280px;
  margin-top: -5px;
  /* 添加负边距，进一步减少与上方的距离 */
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.publish-title {
  color: #ff2e4d;
  text-align: center;
  margin-bottom: 6px;
  /* 减少标题与表单之间的距离 */
  font-size: 20px;
}

.publish-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 10px;
  /* 减少表单项之间的间距 */
}

.input-group textarea {
  height: 80px;
  /* 减少文本域高度 */
  resize: none;
  border-radius: 15px;
}

label {
  font-weight: bold;
  color: #333;
  margin-bottom: 3px;
  /* 减少标签与输入框之间的距离 */
  display: block;
}

input[type="text"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 5px 10px;
  /* 减少输入框的内边距 */
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
}

input[type="file"] {
  display: none;
}

.image-upload {
  position: relative;
}

.upload-area {
  border: 2px dashed #ff2e4d;
  border-radius: 5px;
  height: 70px;
  /* 减少上传区域的高度 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
}

.upload-icon {
  font-size: 22px;
  /* 缩小图标大小 */
  color: #ff2e4d;
}

.upload-text {
  margin-top: 5px;
  color: #333;
}

.uploaded-image {
  position: relative;
}

.image-preview {
  border-radius: 5px;
  width: 100%;
  height: 70px;
  /* 减少预览图片的高度 */
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
}

.publish-button {
  background-color: #ff2e4d;
  color: white;
  padding: 5px;
  /* 减少按钮的内边距 */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 6px;
  /* 减少按钮与上方内容的距离 */
}

.publish-button:hover {
  background-color: #e41d3e;
}
</style>
