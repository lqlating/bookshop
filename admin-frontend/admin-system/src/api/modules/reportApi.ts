// @ts-nocheck
import axiosInstance from "../axiosInstance";

const reportApi = {
    // 获取文章类型的举报
    getReportsByArticleType() {
        return axiosInstance.get('/getReportsByArticleType');
    },

    // 获取书籍类型的举报
    getReportsByBookType() {
        return axiosInstance.get('/getReportsByBookType');
    },

    // 获取评论类型的举报
    getReportsByCommentType() {
        return axiosInstance.get('/getReportsByCommentType');
    },

    // 获取用户类型的举报
    getReportsByUserType() {
        return axiosInstance.get('/getReportsByUserType');
    },

    // 根据内容类型获取举报
    getReportsByContentType(contentType) {
        return axiosInstance.get(`/getReportsByContentType?contentType=${contentType}`);
    },

    // 添加举报
    addReport(reportData) {
        return axiosInstance.post('/addReport', reportData);
    },

    // 删除举报
    deleteReport(reportId) {
        return axiosInstance.delete(`/deleteReport/${reportId}`);
    },

    // 忽略举报
    ignoreReport(contentId, contentType) {
        return axiosInstance.post('/ignoreReport', {
            contentId,
            contentType
        });
    }
};

export default reportApi; 