import axiosInstance from "../axiosInstance";

const titleApi = {
    // 查询所有标题
    getAllTitles() {
        return axiosInstance.get('/title/all');
    },

    // 根据标题查询
    getTitleByName(title) {
        return axiosInstance.get(`/title/search?title=${title}`);
    },

    // 插入新标题
    insertTitle(titleData) {
        return axiosInstance.post('/title/insert', titleData);
    },

    // 删除标题
    deleteTitle(id) {
        return axiosInstance.delete(`/title/delete?id=${id}`);
    }
};

export default titleApi; 