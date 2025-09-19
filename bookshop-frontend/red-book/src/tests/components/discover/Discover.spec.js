import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Discover from '@/components/discover/Discover.vue';

// 模拟 API
vi.mock('@/api/articleApi', () => ({
    default: {
        getLatestArticles: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                data: [
                    {
                        article_id: '1',
                        title: '测试文章1',
                        content: '这是测试内容1',
                        author_id: '101',
                        author_name: '用户1',
                        preview_image: 'image1.jpg',
                        create_time: '2023-05-01'
                    },
                    {
                        article_id: '2',
                        title: '测试文章2',
                        content: '这是测试内容2',
                        author_id: '102',
                        author_name: '用户2',
                        preview_image: 'image2.jpg',
                        create_time: '2023-05-02'
                    }
                ]
            }
        }),
        searchArticleByTitle: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                data: [
                    {
                        article_id: '3',
                        title: '搜索结果',
                        content: '这是搜索结果内容',
                        author_id: '103',
                        author_name: '用户3',
                        preview_image: 'image3.jpg',
                        create_time: '2023-05-03'
                    }
                ]
            }
        })
    }
}));

// 模拟 ElMessage
vi.mock('element-plus', () => ({
    ElMessage: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn()
    }
}));

describe('Discover.vue', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(Discover, {
            global: {
                stubs: {
                    ArticleDisplay: true,
                    UserList: true,
                    ElMessage: true
                }
            }
        });

        // 等待异步操作完成
        await flushPromises();
    });

    it('正确渲染发现页面', () => {
        expect(wrapper.find('.discover-container').exists()).toBe(true);
        expect(wrapper.find('.search-box').exists()).toBe(true);
        expect(wrapper.find('.article-list').exists()).toBe(true);
    });

    it('初始化时加载最新文章', async () => {
        expect(require('@/api/articleApi').default.getLatestArticles).toHaveBeenCalled();
        await flushPromises();

        // 检查是否渲染了文章
        expect(wrapper.findAllComponents({ name: 'ArticleDisplay' }).length).toBeGreaterThan(0);
    });

    it('搜索功能正常工作', async () => {
        // 输入搜索关键词
        const searchInput = wrapper.find('input[type="text"]');
        await searchInput.setValue('测试搜索');

        // 触发搜索
        await wrapper.find('.search-button').trigger('click');
        await flushPromises();

        // 验证搜索API被调用
        expect(require('@/api/articleApi').default.searchArticleByTitle).toHaveBeenCalledWith('测试搜索');
    });

    it('切换用户/文章视图', async () => {
        // 默认显示文章列表
        expect(wrapper.find('.article-list').isVisible()).toBe(true);
        expect(wrapper.findComponent({ name: 'UserList' }).exists()).toBe(false);

        // 切换到用户视图
        const viewToggleButtons = wrapper.findAll('.view-toggle button');
        await viewToggleButtons[1].trigger('click');

        // 检查用户列表是否显示
        expect(wrapper.findComponent({ name: 'UserList' }).exists()).toBe(true);
    });

    it('无限滚动加载更多文章', async () => {
        // 模拟滚动事件
        const initialCallCount = require('@/api/articleApi').default.getLatestArticles.mock.calls.length;

        // 触发滚动到底部
        global.dispatchEvent(new Event('scroll'));
        await wrapper.vm.$nextTick();

        // 加载更多文章的函数应该被调用
        expect(require('@/api/articleApi').default.getLatestArticles.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
}); 