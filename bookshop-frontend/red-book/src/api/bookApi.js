// src/api/bookApi.js

import axiosInstance from "./axiosInstance";

const bookApi = {
    // 获取所有书籍列表
    listBooks(page, size) {
        return axiosInstance.get('/book/list', { params: { page, size } });
    },

    // 根据书籍 ID 获取书籍详情
    getBookById(bookId) {
        return axiosInstance.get(`/book/${bookId}`);
    },

    // 添加新书籍
    addBook(book) {
        return axiosInstance.post('/book/addBook', book);
    },

    // 更新书籍信息
    updateBook(book) {
        return axiosInstance.put('/book/update', book);
    },

    // 根据书籍 ID 删除书籍
    deleteBook(bookId) {
        return axiosInstance.delete(`/book/delete/${bookId}`);
    },

    // 根据书籍类型获取书籍列表
    getBooksByType(bookType, page, size) {
        return axiosInstance.get(`/book/type/${bookType}`, { params: { page, size } });
    },

    // 根据书名搜索书籍（精确匹配）
    getBooksByTitle(title, page, size) {
        return axiosInstance.get(`/book/search`, { params: { title, page, size } });
    },

    // 根据书名搜索书籍（模糊匹配）
    getBooksByTitleContaining(title, page, size) {
        return axiosInstance.get(`/book/search/title`, { params: { title, page, size } });
    },

    // 根据书名精确搜索书籍
    getBooksByExactTitle(title, page, size) {
        return axiosInstance.get(`/book/search`, { params: { title, page, size } });
    },

    // 根据卖家ID获取该卖家发布的所有书籍
    getBooksBySellerId(sellerId, page, size) {
        return axiosInstance.get(`/book/seller/${sellerId}`, { params: { page, size } });
    }
};

export default bookApi;