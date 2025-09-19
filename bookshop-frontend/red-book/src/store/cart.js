import { defineStore } from 'pinia';
import { ref } from 'vue';
import cartApi from '../api/cartApi';

export const cartStore = defineStore('cart', () => {
  // 购物车列表
  const cartLists = ref([]);

  // 根据用户 ID 获取购物车列表
  async function fetchCartsByOwnerId(ownerId) {
    try {
      console.log("fetchCartsByOwnerId", ownerId);
      const res = await cartApi.getCartsByOwnerId(ownerId);
      cartLists.value = res.data.data;
    } catch (error) {
      console.error(`获取用户 ${ownerId} 的购物车失败:`, error);
    }
  }

  // 添加商品到购物车
  async function addCart(ownerId, bookId) {
    try {
      await cartApi.addCart(ownerId, bookId);
      await fetchCartsByOwnerId(ownerId); // 重新获取购物车列表
    } catch (error) {
      console.error("添加商品到购物车失败:", error);
    }
  }

  // 更新购物车商品信息
  async function updateCart(ownerId, cart) {
    try {
      await cartApi.updateCart(cart);
      await fetchCartsByOwnerId(ownerId); // 重新获取购物车列表
    } catch (error) {
      console.error("更新购物车商品失败:", error);
    }
  }

  // 根据购物车 ID 删除单个商品
  async function deleteCart(ownerId, cartId) {
    try {
      await cartApi.deleteCart(cartId);
      await fetchCartsByOwnerId(ownerId); // 重新获取购物车列表
    } catch (error) {
      console.error("删除购物车商品失败:", error);
    }
  }

  // 批量删除购物车商品
  async function deleteCarts(ownerId, cartIds) {
    try {
      await cartApi.deleteCarts(cartIds);
      await fetchCartsByOwnerId(ownerId); // 重新获取购物车列表
    } catch (error) {
      console.error("批量删除购物车商品失败:", error);
    }
  }

  return {
    cartLists,
    fetchCartsByOwnerId,
    addCart,
    updateCart,
    deleteCart,
    deleteCarts,
  };
});
