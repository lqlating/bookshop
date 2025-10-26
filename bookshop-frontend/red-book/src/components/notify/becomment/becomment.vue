<script setup>
import { ref, onMounted } from 'vue';
import { userInfoStore } from '../../../store/user';
import commentApi from '../../../api/commentApi';
import like_comment from '../../comment/like_comment/like_comment.vue';
import userApi from '../../../api/userApi';
import articleApi from '../../../api/articleApi';

const userStore = userInfoStore();
const { id } = userStore.userThing;
const replyComments = ref([]);
const isComment = true;

// 格式化日期
function formatDate(publishTime) {
    const currentDate = new Date();
    const publishDate = new Date(publishTime);

    // 获取当前年份和发布年份
    const currentYear = currentDate.getFullYear();
    const publishYear = publishDate.getFullYear();

    // 如果同年，则只显示月和日
    if (currentYear === publishYear) {
        return publishTime.slice(5); // 返回格式为 "xx-xx"
    } else {
        return publishTime; // 返回完整格式 "xxxx-xx-xx"
    }
}

// 获取回复的评论
async function getReplyComent() {
    try {
        const res = await commentApi.BeReplyComment(id);
        const comments = res.data.data;

        for (let comment of comments) {
            // 获取用户信息，并进行空值检查
            const userRes = await userApi.SearchUserById(comment.user_id);
            if (userRes?.data?.data?.length > 0) {
                comment.username = userRes.data.data[0].username;
                comment.avatar_base64 = userRes.data.data[0].avatar_base64 || '';
            } else {
                comment.username = '匿名用户';
                comment.avatar_base64 = '';
            }

            // 获取被回复的评论，并进行空值检查
            const bereplyRes = await commentApi.GetCommentById(comment.parent_id);
            if (bereplyRes?.data?.data?.length > 0) {
                comment.bereply = bereplyRes.data.data[0].content;
            } else {
                comment.bereply = '无内容';
            }

            // 获取文章信息，并进行空值检查
            const articleRes = await articleApi.getArticlesByIds([comment.article_id]);
            if (articleRes?.data?.data?.length > 0) {
                comment.article_bark = articleRes.data.data[0].img_url; // 假设获取的文章信息是文章封面或标题
            } else {
                comment.article_bark = '无文章信息';
            }

            // 格式化发布的时间
            comment.formattedTime = formatDate(comment.publish_time);
        }

        replyComments.value = comments;
    } catch (error) {
        console.error("请求失败:", error);
    }
}

onMounted(() => {
    getReplyComent();
});
</script>

<template>
    <div class="main-body">
        <like_comment v-for="replyComment in replyComments" :isComment="isComment" :replyComment="replyComment"
            :key="replyComment.id" :user_id="id">

            <template #reply_name>
                {{ replyComment.username }}
            </template>

            <template #date>
                {{ replyComment.formattedTime }} <!-- 显示格式化后的时间 -->
            </template>

            <template #reply_txt>
                {{ replyComment.content }}
            </template>

            <template #bereplyed_txt>
                {{ replyComment.bereply ? replyComment.bereply : '无内容' }}
            </template>

            <template #article_bark>
                {{ replyComment.article_bark ? replyComment.article_bark : '无文章信息' }}
            </template>

        </like_comment>
        <div class="end-line">- THE END -</div>
    </div>
</template>

<style scoped>
.main-body {
    padding-top: 10px;
    max-height: 500px;
    /* 设置最大高度 */
    overflow-y: auto;
    /* 允许竖向滚动 */
    scrollbar-width: none;
    /* 对于 Firefox 隐藏滚动条 */
    -ms-overflow-style: none;
    /* 对于 IE 和 Edge 隐藏滚动条 */
}

/* 对于 WebKit 浏览器隐藏滚动条 */
.main-body::-webkit-scrollbar {
    display: none;
}

.end-line {
    margin-top: 20px;
    margin-left: 350px;
    font-size: 12px;
    color: #33333399;
}
</style>
