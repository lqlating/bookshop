import axiosInstance from "../axiosInstance";

interface PaginationParams {
    page: number
    size: number
}

const articleApi = {
    // 获取待审核文章（带分页）
    getPendingArticles(params: PaginationParams = { page: 1, size: 10 }) {
        return axiosInstance.get('/getUnreviewedArticles', {
            params: {
                page: params.page,
                size: params.size
            }
        });
    },
    // 获取已封禁文章（带分页）
    getBannedArticles(params: PaginationParams = { page: 1, size: 10 }) {
        return axiosInstance.get('/getBannedArticles', {
            params: {
                page: params.page,
                size: params.size
            }
        });
    },
    // 审核通过
    setReviewed(articleId: number) {
        return axiosInstance.put(`/setReviewed/${articleId}`);
    },
    // 审核通过并封禁
    setReviewedAndBanned(articleId: number) {
        return axiosInstance.put(`/setReviewedAndBanned/${articleId}`);
    },
    // 按类型筛选文章（带分页）
    Filtercontent(type: string, params: PaginationParams = { page: 1, size: 10 }) {
        return axiosInstance.get(`/FilterContent/${type}`, {
            params: {
                page: params.page,
                size: params.size
            }
        });
    },
    // 根据ID列表获取文章
    getArticlesByIds(articleIds: number[]) {
        return axiosInstance.post('/getArticlesByIds', articleIds);
    },
    // 根据作者ID获取文章（带分页）
    getArticlesByAuthorId(authorId: number, params: PaginationParams = { page: 1, size: 10 }) {
        return axiosInstance.get(`/getArticlesByAuthorId/${authorId}`, {
            params: {
                page: params.page,
                size: params.size
            }
        });
    },
    // 添加文章
    addArticle(article: any) {
        return axiosInstance.post('/addArticle', article);
    },
    // 解封文章
    unbanArticle(articleId: number) {
        return axiosInstance.put(`/unbanArticle/${articleId}`);
    },
    // 删除文章
    deleteArticle(articleId: number) {
        return axiosInstance.delete(`/deleteArticle/${articleId}`);
    }
};

export default articleApi;