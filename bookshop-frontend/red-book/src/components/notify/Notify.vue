<script setup>
// 你的其他脚本代码
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { conversationStore } from '@/store/conversation';
import { storeToRefs } from 'pinia';
import { userInfoStore } from '@/store/user';

const router = useRouter();
const conversationStoreInstance = conversationStore();
const { totalUnreadCount } = storeToRefs(conversationStoreInstance);
const userStore = userInfoStore();

onMounted(async () => {
    if (router.currentRoute.value.path === '/Notify') {
        router.push('/Notify/becomment');
    }
    // 获取未读消息数
    if (userStore.isLogin) {
        await conversationStoreInstance.updateTotalUnreadCount(userStore.userThing.id);
    }
});
</script>

<template>
    <div class="mainbody">
        <div class="Navigation_Bar">
            <RouterLink class="operation" to="/Notify/becomment" active-class="active">
                评论和@
            </RouterLink>
            <!-- <RouterLink 
                class="operation" 
                to="/Notify/like_star"
                active-class="active">
                赞和收藏
            </RouterLink> -->
            <RouterLink class="operation" to="/Notify/newSubscript" active-class="active">
                新增关注
            </RouterLink>
            <RouterLink class="operation" to="/Notify/privateChat" active-class="active">
                <span class="chat-link">
                    私聊
                    <div v-if="totalUnreadCount.value > 0" class="unread-dot"></div>
                </span>
            </RouterLink>
            <RouterLink class="operation" to="/Notify/transactions" active-class="active">
                买卖交易
            </RouterLink>
        </div>
        <div class="main-area">
            <RouterView :key="router.currentRoute.path" />
        </div>
    </div>
</template>

<style scoped>
.mainbody {
    width: 757px;
    margin: 0px auto 0px 130px;
}

.operation {
    display: inline-block;
    position: relative;
    box-sizing: border-box;
    width: 96.5px;
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    border-radius: 16px;
    text-align: center;
    text-decoration: none;
    color: #333333cc;
    font-weight: 500;
    overflow: hidden;
    z-index: 1;
    /* 提升文本内容的层级 */
    transition: color 0.3s, font-weight 0.3s;
    /* 平滑过渡效果 */
}

.operation::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    transition: left 0.3s;
    z-index: -1;
    /* 将伪元素的层级置于文本内容后面 */
}

.operation.active::before {
    left: 0;
}

.operation:hover {
    font-weight: bold;
    /* 点击状态下的字体加粗 */
}

.operation.active {
    color: #000000;
    /* 鼠标悬停时字体颜色加深 */
    font-weight: 600;
    /* 鼠标悬停时字体稍微加粗 */
}

.Navigation_Bar {
    display: flex;
    gap: 10px;
    border-bottom: 2px solid #f0f0f0;
    /* 添加分割线 */
    padding-bottom: 10px;
    /* 给分割线和内容之间添加一些间距 */
}

.chat-link {
    position: relative;
    display: inline-block;
}

.unread-dot {
    position: absolute;
    top: 0;
    right: -8px;
    width: 8px;
    height: 8px;
    background-color: #ff2e4d;
    border-radius: 50%;
    z-index: 2;
}
</style>
