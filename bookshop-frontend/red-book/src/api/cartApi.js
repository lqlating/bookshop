import axiosInstance from "./axiosInstance";

const cartApi = {
    // 获取购物车列表
    listCarts() {
        return axiosInstance.get('/carts/list');
    },
    // 添加商品到购物车
    addCart(owner_id, book_id) {
        return axiosInstance.get('/carts/add', {
            params: {
                owner_id,
                book_id
            }
        });
    },
    // 更新购物车商品信息
    updateCart(cart) {
        return axiosInstance.put('/carts/update', cart);
    },
    // 根据购物车 ID 删除单个商品
    deleteCart(cart_id) {
        return axiosInstance.delete(`/carts/delete/${cart_id}`);
    },
    // 批量删除购物车商品
    deleteCarts(cart_ids) {
        return axiosInstance.delete('/carts/delete', {
            data: cart_ids
        });
    },
    // 根据用户 ID 获取购物车列表
    getCartsByOwnerId(owner_id) {
        return axiosInstance.get(`/carts/owner/${owner_id}`);
    }
};

export default cartApi;
