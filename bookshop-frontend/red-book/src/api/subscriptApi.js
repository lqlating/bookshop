import axiosInstance from "./axiosInstance";

const subscriptApi = {
    // 根据用户 ID 获取已订阅的用户的 ID 列表
    getTargetId(userId) {
        return axiosInstance.get(`/getTargetIds/${userId}`);
    },

    // 添加订阅
    insertSubscript(userId, targetId) {
        return axiosInstance.post('/addSubscription', null, {
            params: {
                userId,
                targetId,
            },
        });
    },

    // 删除订阅
    deleteSubscript(userId, targetId) {
        return axiosInstance.delete(`/deleteSubscript/${userId}/${targetId}`);
    },

    // 查询已经关注该用户的所有人的id
    getUserIdbyTargetId(targetId) {
        return axiosInstance.get(`/getUserIdsByTargetId/${targetId}`);
    },
    // 新增接口：查询关注数量
    countSubscriptionsByUserId(userId) {
        return axiosInstance.get(`/operation/countSubscriptionsByUserId/${userId}`);
    }
};

export default subscriptApi;
