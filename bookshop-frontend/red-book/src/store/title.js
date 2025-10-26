// stores/titleStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import titleApi from '../api/titleApi'; // 导入封装好的 API 文件

export const titleStore = defineStore('title', () => {
  // 存储所有标题列表
  const titleList = ref([]);

  // 查询所有标题
  async function fetchAllTitles() {
    try {
      // 先清空 titleList
      titleList.value.splice(0, titleList.value.length);

      const res = await titleApi.getAllTitles();
      if (res.data.data && res.data.data.length > 0) {
        Object.assign(titleList.value, res.data.data);
      }
    } catch (error) {
      console.error('Error fetching titles:', error);
      titleList.value.splice(0, titleList.value.length);
    }
  }

  // 插入新标题
  async function insertTitle(title, value) {
    try {
      const res = await titleApi.insertTitle(title, value);
      if (res.data.success) {
        // 插入成功后，手动添加到 titleList 以更新前端状态
        titleList.value.push({ title, value });
      }
      return res;
    } catch (error) {
      console.error('Error inserting title:', error);
      return null;
    }
  }

  // 删除标题
  async function deleteTitle(id) {
    try {
      const res = await titleApi.deleteTitle(id);
      if (res.data.success) {
        // 删除成功后，更新 titleList
        titleList.value = titleList.value.filter(item => item.id !== id);
      }
      return res;
    } catch (error) {
      console.error('Error deleting title:', error);
      return null;
    }
  }

  // 根据标题获取特定的 title
  function getTitleByName(title) {
    return titleList.value.find(item => item.title === title) || null;
  }

  return {
    titleList,
    fetchAllTitles,
    insertTitle,
    deleteTitle,
    getTitleByName,
  };
});
