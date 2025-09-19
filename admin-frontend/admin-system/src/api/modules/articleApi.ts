import axiosInstance from "../axiosInstance";

const articleApi = {
    // 获取待审核文章
    getPendingArticles() {
        return axiosInstance.get('/getUnreviewedArticles');
    },
    // 获取已封禁文章
    getBannedArticles() {
        return axiosInstance.get('/getBannedArticles');
    },
    // 审核通过
    setReviewed(articleId: number) {
        return axiosInstance.put(`/setReviewed/${articleId}`);
    },
    // 审核通过并封禁
    setReviewedAndBanned(articleId: number) {
        return axiosInstance.put(`/setReviewedAndBanned/${articleId}`);
    },
    // 按类型筛选文章
    Filtercontent(type: string) {
        return axiosInstance.get(`/FilterContent/${type}`);
    },
    // 根据ID列表获取文章
    getArticlesByIds(articleIds: number[]) {
        return axiosInstance.post('/getArticlesByIds', articleIds);
    },
    // 根据作者ID获取文章
    getArticlesByAuthorId(authorId: number) {
        return axiosInstance.get(`/getArticlesByAuthorId/${authorId}`);
    },
    // 添加文章
    addArticle(article: any) {
        return axiosInstance.post('/addArticle', article);
    },
    // 解封文章
    unbanArticle(articleId: number) {
        return axiosInstance.put(`/unbanArticle/${articleId}`);
    }
};

export default articleApi;