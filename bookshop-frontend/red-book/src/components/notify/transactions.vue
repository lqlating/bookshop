<template>
    <div class="transactions-container">
        <div class="tabs">
            <button :class="['tab-btn', { active: activeTab === 'received' }]" @click="activeTab = 'received'">
                收到的申请
            </button>
            <button :class="['tab-btn', { active: activeTab === 'sent' }]" @click="activeTab = 'sent'">
                发出的申请
            </button>
        </div>

        <!-- 收到的申请 -->
        <div v-if="activeTab === 'received'" class="transaction-list">
            <div class="rules-notice">
                <i class="el-icon-warning-outline"></i>
                <span>交易规则提示：</span>
                <p>当您点击"同意"后，系统会自动将书本标记为已卖出状态。为了保证交易双方的权益，请在完成线下交易后再进行确认操作！</p>
            </div>

            <div v-for="transaction in receivedTransactions" :key="transaction.transaction_id" class="transaction-item">
                <div class="transaction-content">
                    <span class="user-name">{{ transaction.buyerName }}</span>
                    向您发起了购买《{{ transaction.book?.book_title || '未知书籍' }}》的申请
                </div>
                <div class="action-area">
                    <div v-if="transaction.status === 'pending'" class="action-buttons">
                        <button class="accept-btn"
                            @click="handleTransaction(transaction.transaction_id, 'accepted')">同意</button>
                        <button class="reject-btn"
                            @click="handleTransaction(transaction.transaction_id, 'rejected')">拒绝</button>
                    </div>
                    <div v-else class="status-text" :class="transaction.status">
                        {{ getStatusText(transaction.status) }}
                    </div>
                </div>
            </div>
            <div v-if="receivedTransactions.length === 0" class="empty-message">
                暂无收到的申请
            </div>
        </div>

        <!-- 发出的申请 -->
        <div v-if="activeTab === 'sent'" class="transaction-list">
            <div v-for="transaction in sentTransactions" :key="transaction.transaction_id" class="transaction-item">
                <div class="transaction-content">
                    您向<span class="user-name">{{ transaction.sellerName }}</span>
                    发起了购买《{{ transaction.book?.book_title || '未知书籍' }}》的申请
                </div>
                <div class="status-text" :class="transaction.status">
                    {{ getStatusText(transaction.status) }}
                </div>
            </div>
            <div v-if="sentTransactions.length === 0" class="empty-message">
                暂无发出的申请
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userInfoStore } from '@/store/user';
import { getBuyerTransactions, getSellerTransactions, processTransaction } from '@/api/transaction';
import userApi from '@/api/userApi';
import { ElMessage } from 'element-plus';

const userStore = userInfoStore();
const currentUserId = userStore.userThing.id;

const activeTab = ref('received');
const receivedTransactions = ref([]);
const sentTransactions = ref([]);

// 获取用户信息
const getUserInfo = async (userId) => {
    try {
        const response = await userApi.SearchUserById(userId);
        if (response.data.code === 1 && response.data.data?.length > 0) {
            return response.data.data[0].username;
        }
        return '未知用户';
    } catch (error) {
        console.error('获取用户信息失败：', error);
        return '未知用户';
    }
};

// 处理交易数据，添加用户信息
const processTransactionData = async (transactions) => {
    const processedTransactions = [];
    for (const transaction of transactions) {
        const buyerName = await getUserInfo(transaction.buyer_id);
        const sellerName = await getUserInfo(transaction.seller_id);
        processedTransactions.push({
            ...transaction,
            buyerName,
            sellerName
        });
    }
    return processedTransactions;
};

// 获取交易列表
onMounted(async () => {
    try {
        // 获取收到的申请（作为卖家）
        const sellerResponse = await getSellerTransactions(currentUserId);
        if (sellerResponse.code === 1) {
            receivedTransactions.value = await processTransactionData(sellerResponse.data);
        }

        // 获取发出的申请（作为买家）
        const buyerResponse = await getBuyerTransactions(currentUserId);
        if (buyerResponse.code === 1) {
            sentTransactions.value = await processTransactionData(buyerResponse.data);
        }
    } catch (error) {
        console.log('Fetching transactions...');
    }
});

// 处理图片路径
const getImageSrc = (image) => {
    if (!image) return 'https://via.placeholder.com/50';
    if (image.startsWith('data:image')) return image;
    if (/^[A-Za-z0-9+/=]+$/.test(image) && image.length > 20) {
        return `data:image/jpeg;base64,${image}`;
    }
    return image;
};

// 获取状态文本
const getStatusText = (status) => {
    switch (status) {
        case 'pending':
            return '等待处理';
        case 'accepted':
            return '已接受';
        case 'rejected':
            return '已拒绝';
        default:
            return '未知状态';
    }
};

// 处理交易申请
const handleTransaction = async (transactionId, action) => {
    try {
        const response = await processTransaction(transactionId, action);
        if (response.code === 1) {
            ElMessage.success(action === 'accepted' ? '已同意交易申请' : '已拒绝交易申请');

            // 重新获取交易列表
            const sellerResponse = await getSellerTransactions(currentUserId);
            if (sellerResponse.code === 1) {
                receivedTransactions.value = await processTransactionData(sellerResponse.data);
            }

            const buyerResponse = await getBuyerTransactions(currentUserId);
            if (buyerResponse.code === 1) {
                sentTransactions.value = await processTransactionData(buyerResponse.data);
            }
        }
    } catch (error) {
        console.log('Processing transaction...');
    }
};
</script>

<style scoped>
.transactions-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.tabs {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.tab-btn {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 16px;
    border-bottom: 2px solid transparent;
    transition: all 0.3s;
}

.tab-btn.active {
    color: #ff2e4d;
    border-bottom-color: #ff2e4d;
}

.transaction-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.transaction-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.transaction-content {
    flex: 1;
    font-size: 15px;
    color: #333;
}

.user-name {
    color: #ff2e4d;
    font-weight: bold;
    margin: 0 5px;
}

.action-area {
    display: flex;
    align-items: center;
    gap: 10px;
}

.action-buttons {
    display: flex;
    gap: 10px;
}

.accept-btn,
.reject-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
}

.accept-btn {
    background-color: #ff2e4d;
    color: white;
}

.accept-btn:hover {
    background-color: #e62945;
}

.reject-btn {
    background-color: #f5f5f5;
    color: #666;
}

.reject-btn:hover {
    background-color: #e8e8e8;
}

.status-text {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
}

.status-text.pending {
    background-color: #fff7e6;
    color: #ffa940;
}

.status-text.accepted {
    background-color: #f6ffed;
    color: #52c41a;
}

.status-text.rejected {
    background-color: #fff1f0;
    color: #ff4d4f;
}

.empty-message {
    text-align: center;
    color: #999;
    padding: 40px 0;
    font-size: 14px;
}

.rules-notice {
    background-color: #fff7e6;
    border: 1px solid #ffd591;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.rules-notice i {
    color: #faad14;
    font-size: 18px;
    margin-top: 2px;
}

.rules-notice span {
    color: #d46b08;
    font-weight: bold;
    white-space: nowrap;
}

.rules-notice p {
    margin: 0;
    color: #873800;
    font-size: 14px;
    line-height: 1.5;
}
</style>