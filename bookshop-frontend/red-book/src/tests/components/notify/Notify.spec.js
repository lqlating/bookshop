import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { useRouter } from 'vue-router';
import Notify from '@/components/notify/Notify.vue';

// 模拟路由
vi.mock('vue-router', () => ({
    useRouter: vi.fn().mockReturnValue({
        push: vi.fn()
    })
}));

// 模拟 Pinia 存储
vi.mock('pinia', () => ({
    storeToRefs: vi.fn().mockImplementation(() => ({
        userThing: {
            value: {
                id: '1',
                username: '测试用户',
                avatar_base64: 'mock_avatar_data'
            }
        }
    }))
}));

vi.mock('@/store/user', () => ({
    userInfoStore: vi.fn().mockImplementation(() => ({
        userThing: {
            id: '1',
            username: '测试用户',
            avatar_base64: 'mock_avatar_data'
        }
    }))
}));

// 模拟通知API
vi.mock('@/api/notificationApi', () => ({
    default: {
        getUnreadCount: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                data: {
                    like_count: 5,
                    comment_count: 3,
                    subscript_count: 2
                }
            }
        }),
        markAsRead: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                msg: '标记成功'
            }
        })
    }
}));

describe('Notify.vue', () => {
    let wrapper;
    const router = useRouter();

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(Notify, {
            global: {
                stubs: {
                    RouterLink: true,
                    RouterView: true,
                    'like_star': true,
                    'becomment': true,
                    'newSubscript': true
                }
            }
        });

        // 等待异步操作完成
        await flushPromises();
    });

    it('正确渲染通知页面', () => {
        expect(wrapper.find('.notify-container').exists()).toBe(true);
        expect(wrapper.find('.notify-tabs').exists()).toBe(true);

        // 验证三个通知类型选项卡存在
        const tabs = wrapper.findAll('.tab-item');
        expect(tabs.length).toBe(3);
    });

    it('初始化时加载未读通知数', async () => {
        expect(require('@/api/notificationApi').default.getUnreadCount).toHaveBeenCalled();

        // 验证未读数显示
        const badgeElements = wrapper.findAll('.badge');
        expect(badgeElements.length).toBeGreaterThan(0);

        // 验证第一个未读数为5（点赞）
        expect(badgeElements[0].text()).toBe('5');
    });

    it('切换通知类型选项卡', async () => {
        const tabs = wrapper.findAll('.tab-item');

        // 默认应该显示第一个选项卡（点赞）
        expect(wrapper.find('.like-star-container').exists()).toBe(true);

        // 点击第二个选项卡（评论）
        await tabs[1].trigger('click');
        expect(wrapper.find('.becomment-container').exists()).toBe(true);

        // 点击第三个选项卡（新订阅）
        await tabs[2].trigger('click');
        expect(wrapper.find('.subscript-container').exists()).toBe(true);
    });

    it('标记通知为已读', async () => {
        const markAsReadButton = wrapper.find('.mark-read-btn');
        expect(markAsReadButton.exists()).toBe(true);

        // 点击标记为已读按钮
        await markAsReadButton.trigger('click');

        // 确认对话框
        await wrapper.find('.confirm-read-btn').trigger('click');

        // 验证API调用
        expect(require('@/api/notificationApi').default.markAsRead).toHaveBeenCalled();
    });

    it('点击私信按钮导航到私信页面', async () => {
        const chatButton = wrapper.find('.private-chat-btn');
        expect(chatButton.exists()).toBe(true);

        // 点击私信按钮
        await chatButton.trigger('click');

        // 验证路由导航
        expect(router.push).toHaveBeenCalledWith('/notify/chat');
    });

    it('显示正确的未读通知总数', () => {
        // 总未读数应该是5+3+2=10
        const totalBadge = wrapper.find('.total-badge');
        expect(totalBadge.exists()).toBe(true);
        expect(totalBadge.text()).toBe('10');
    });

    it('处理没有通知的情况', async () => {
        // 模拟空通知响应
        require('@/api/notificationApi').default.getUnreadCount.mockResolvedValueOnce({
            data: {
                code: 1,
                data: {
                    like_count: 0,
                    comment_count: 0,
                    subscript_count: 0
                }
            }
        });

        const emptyWrapper = mount(Notify, {
            global: {
                stubs: {
                    RouterLink: true,
                    RouterView: true,
                    'like_star': true,
                    'becomment': true,
                    'newSubscript': true
                }
            }
        });

        await flushPromises();

        // 验证空状态提示
        expect(emptyWrapper.find('.empty-notify').exists()).toBe(true);
    });
}); 