import axiosInstance from "./axiosInstance";
import request from '../utils/request';

const searchApi = {
    // 搜索文章，通过 title 或 content
    searchArticle(keyword) {
        return axiosInstance.get(`/SearchArticle?keyword=${keyword}`);
    },

    // 搜索用户，通过 username
    searchUserByUsername(username) {
        return axiosInstance.get(`/SearchUserByUsername?username=${username}`);
    },

    // 修改搜索书籍的方法
    searchBooksByTitle(title) {
        return axiosInstance.get(`/book/search/title`, { params: { title } });
    }
}

export default searchApi;
