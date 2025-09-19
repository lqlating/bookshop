// src/api/titleApi.js
import axiosInstance from "./axiosInstance";

const titleApi = {
    // 查询所有标题
    getAllTitles() {
        return axiosInstance.get('/title/all');
    },

    // 根据标题查询
    getTitleByName(title) {
        return axiosInstance.get('/title/search', {
            params: { title }
        });
    },

    // 插入新标题
    insertTitle(title, value) {
        return axiosInstance.post('/title/insert', {
            title,
            value
        });
    },

    // 删除标题
    deleteTitle(id) {
        return axiosInstance.delete('/title/delete', {
            data: { id }
        });
    }
};

export default titleApi;
