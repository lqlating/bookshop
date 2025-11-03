import axiosInstance from "./axiosInstance";

const articleApi = {
    Filtercontent(value, page, size) {
        console.log(`发起请求: Filtercontent(${value}, ${page}, ${size})`);
        return axiosInstance.get(`/FilterContent/${value}`, { params: { page, size } })
            .then(response => {
                console.log(`Filtercontent(${value}, ${page}, ${size}) 返回:`, response.data);
                return response;
            });
    },
    // 根据类型过滤文章并排除特定作者ID
    FiltercontentExcludeAuthor(value, authorId, page, size) {
        console.log(`发起请求: FiltercontentExcludeAuthor(${value}, ${authorId}, ${page}, ${size})`);
        return axiosInstance.get(`/FilterContent/${value}/${authorId}`, { params: { page, size } })
            .then(response => {
                console.log(`FiltercontentExcludeAuthor(${value}, ${authorId}, ${page}, ${size}) 返回:`, response.data);
                return response;
            });
    },
    getArticlesByIds(articleIds) {
        return axiosInstance.post('/getArticlesByIds', articleIds);
    },
    getArticlesByAuthorId(authorId, page, size) {  // 新增的接口
        return axiosInstance.get(`/getArticlesByAuthorId/${authorId}`, { params: { page, size } });
    },
    // 根据关键词搜索文章
    searchArticle(keyword, page, size) {
        console.log(`发起请求: searchArticle(${keyword}, ${page}, ${size})`);
        return axiosInstance.get(`/SearchArticle`, { params: { keyword, page, size } })
            .then(response => {
                console.log(`searchArticle(${keyword}, ${page}, ${size}) 返回:`, response.data);
                return response;
            });
    },
    // 根据关键词搜索文章并排除特定作者ID
    searchArticleExcludeAuthor(keyword, authorId, page, size) {
        console.log(`发起请求: searchArticleExcludeAuthor(${keyword}, ${authorId}, ${page}, ${size})`);
        return axiosInstance.get(`/SearchArticle/${authorId}`, { params: { keyword, page, size } })
            .then(response => {
                console.log(`searchArticleExcludeAuthor(${keyword}, ${authorId}, ${page}, ${size}) 返回:`, response.data);
                return response;
            });
    },
    // 添加新文章
    addArticle(article) {
        // 对于FormData，让拦截器删除Content-Type，让浏览器自动设置正确的multipart/form-data（包括boundary）
        return axiosInstance.post('/addArticle', article, {
            transformRequest: [(data, headers) => {
                // 如果数据是FormData，删除Content-Type让浏览器自动设置
                if (data instanceof FormData) {
                    delete headers['Content-Type'];
                }
                return data;
            }]
        });
    },
    // 删除文章
    deleteArticle(articleId) {
        return axiosInstance.delete(`/deleteArticle/${articleId}`);
    }
};

export default articleApi;