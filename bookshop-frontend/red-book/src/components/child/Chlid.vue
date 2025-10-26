<script setup lang="ts">
import axios from 'axios'
import { onMounted, reactive } from 'vue';
import request from '../../utils/request'
import object from 'lodash-es/object';
// 创建一个响应式的 tableData 数组
let tableData = reactive([]);

// 获取用户数据的函数
async function getUsers(){
    try {
        let response = await axios.get('http://localhost:8080/SearchUser');
        // 将获取到的数据更新到 tableData 中,此处使用object.assign方法，避免整个reactive对象被替换时失去响应式
        //tableData = response.data.data 这是错误的写法
        object.assign(tableData,response.data.data)
        console.log(tableData); // 在此处输出 tableData
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// 当组件挂载完成时调用 getUsers 函数获取数据
onMounted(getUsers)
</script>


<template>
    
    <div class="table-wrapper">
        <el-table :data="tableData" stripe style="width: 100%">
    <el-table-column prop="username" label="Username" width="180" />
    <el-table-column prop="password" label="Password" width="180" />
    <el-table-column prop="avatar" label="Avatar" />
    <el-table-column prop="email" label="Email" width="300"/>
    <el-table-column prop="id" label="ID" width="50"/>
  </el-table>
    </div>
    
</template>

<style scoped>
.table-wrapper{
    width: 70%;
    margin: 0 auto;
    border: 1px solid black;
    max-height: 500px;
    overflow: auto;
}
/* 自定义滚动条样式 */
.table-wrapper::-webkit-scrollbar {
  width: 12px;
}

/* 滚动条轨道 */
.table-wrapper::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

/* 滚动条滑块 */
.table-wrapper::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 6px;
}

/* 鼠标悬停在滑块上时 */
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}
</style>