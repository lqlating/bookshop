import axiosInstance from "./axiosInstance";

const articleApi = {
    Filtercontent(value) {
        console.log(`发起请求: Filtercontent(${value})`);
        return axiosInstance.get(`/FilterContent/${value}`)
            .then(response => {
                console.log(`Filtercontent(${value}) 返回:`, response.data);
                return response;
            });
    },
    // 根据类型过滤文章并排除特定作者ID
    FiltercontentExcludeAuthor(value, authorId) {
        console.log(`发起请求: FiltercontentExcludeAuthor(${value}, ${authorId})`);
        return axiosInstance.get(`/FilterContent/${value}/${authorId}`)
            .then(response => {
                console.log(`FiltercontentExcludeAuthor(${value}, ${authorId}) 返回:`, response.data);
                return response;
            });
    },
    getArticlesByIds(articleIds) {
        return axiosInstance.post('/getArticlesByIds', articleIds);
    },
    getArticlesByAuthorId(authorId) {  // 新增的接口
        return axiosInstance.get(`/getArticlesByAuthorId/${authorId}`);
    },
    // 根据关键词搜索文章
    searchArticle(keyword) {
        console.log(`发起请求: searchArticle(${keyword})`);
        return axiosInstance.get(`/SearchArticle`, { params: { keyword } })
            .then(response => {
                console.log(`searchArticle(${keyword}) 返回:`, response.data);
                return response;
            });
    },
    // 根据关键词搜索文章并排除特定作者ID
    searchArticleExcludeAuthor(keyword, authorId) {
        console.log(`发起请求: searchArticleExcludeAuthor(${keyword}, ${authorId})`);
        return axiosInstance.get(`/SearchArticle/${authorId}`, { params: { keyword } })
            .then(response => {
                console.log(`searchArticleExcludeAuthor(${keyword}, ${authorId}) 返回:`, response.data);
                return response;
            });
    },
    // 添加新文章
    addArticle(article) {
        return axiosInstance.post('/addArticle', article);
    },
    // 删除文章
    deleteArticle(articleId) {
        return axiosInstance.delete(`/deleteArticle/${articleId}`);
    }
};

export default articleApi;
