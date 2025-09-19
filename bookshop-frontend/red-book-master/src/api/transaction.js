import request from '@/utils/request'

// 创建交易申请
export function createTransaction(bookId, buyerId, sellerId) {
    return request({
        url: '/api/transaction/create',
        method: 'post',
        params: {
            book_id: bookId,
            buyer_id: buyerId,
            seller_id: sellerId
        }
    })
}

// 获取用户相关的交易（兼容旧版本）
export function getUserTransactions(userId) {
    return request({
        url: `/api/transaction/user/${userId}`,
        method: 'get',
        params: {
            role: 'all' // 可以是 'buyer', 'seller', 或 'all'
        }
    })
}

// 获取买家交易
export function getBuyerTransactions(buyerId) {
    return request({
        url: `/api/transaction/buyer/${buyerId}`,
        method: 'get'
    })
}

// 获取卖家交易
export function getSellerTransactions(sellerId) {
    return request({
        url: `/api/transaction/seller/${sellerId}`,
        method: 'get'
    })
}

// 处理交易申请
export function processTransaction(transactionId, action) {
    return request({
        url: `/api/transaction/process/${transactionId}`,
        method: 'put',
        params: {
            action: action
        }
    })
} 