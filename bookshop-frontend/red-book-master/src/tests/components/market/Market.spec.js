import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { useRouter } from 'vue-router';
import Market from '@/components/market/Market.vue';

// 模拟 bookApi
vi.mock('@/api/bookApi', () => ({
    default: {
        getRecommendBooks: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                data: [
                    {
                        book_id: '1',
                        title: '测试书籍1',
                        author: '作者1',
                        price: 29.9,
                        cover_image: 'cover1.jpg',
                        description: '这是测试书籍1的描述',
                        tags: ['文学', '小说']
                    },
                    {
                        book_id: '2',
                        title: '测试书籍2',
                        author: '作者2',
                        price: 39.9,
                        cover_image: 'cover2.jpg',
                        description: '这是测试书籍2的描述',
                        tags: ['科技', '计算机']
                    }
                ]
            }
        }),
        searchBooksByTitle: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                data: [
                    {
                        book_id: '3',
                        title: '搜索结果书籍',
                        author: '作者3',
                        price: 49.9,
                        cover_image: 'cover3.jpg',
                        description: '这是搜索结果书籍的描述',
                        tags: ['经济', '管理']
                    }
                ]
            }
        }),
        getBooksByCategory: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                data: [
                    {
                        book_id: '4',
                        title: '分类书籍',
                        author: '作者4',
                        price: 59.9,
                        cover_image: 'cover4.jpg',
                        description: '这是分类书籍的描述',
                        tags: ['历史', '文化']
                    }
                ]
            }
        })
    }
}));

// 模拟 router
vi.mock('vue-router', () => ({
    useRouter: vi.fn().mockReturnValue({
        push: vi.fn()
    })
}));

// 模拟 ElMessage
vi.mock('element-plus', () => ({
    ElMessage: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn()
    }
}));

describe('Market.vue', () => {
    let wrapper;
    const router = useRouter();

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(Market, {
            global: {
                stubs: {
                    'book_item': true,
                    ElMessage: true
                }
            }
        });

        // 等待异步操作完成
        await flushPromises();
    });

    it('正确渲染市场页面', () => {
        expect(wrapper.find('.market-container').exists()).toBe(true);
        expect(wrapper.find('.search-box').exists()).toBe(true);
        expect(wrapper.find('.category-nav').exists()).toBe(true);
        expect(wrapper.find('.book-grid').exists()).toBe(true);
    });

    it('初始化时加载推荐书籍', async () => {
        expect(require('@/api/bookApi').default.getRecommendBooks).toHaveBeenCalled();

        // 验证书籍列表渲染
        const bookItems = wrapper.findAllComponents({ name: 'book_item' });
        expect(bookItems.length).toBeGreaterThan(0);
    });

    it('搜索功能正常工作', async () => {
        // 输入搜索关键词
        const searchInput = wrapper.find('.search-input');
        await searchInput.setValue('测试搜索');

        // 触发搜索
        await wrapper.find('.search-button').trigger('click');
        await flushPromises();

        // 验证搜索API被调用
        expect(require('@/api/bookApi').default.searchBooksByTitle).toHaveBeenCalledWith('测试搜索');
    });

    it('分类导航功能正常工作', async () => {
        // 点击分类按钮
        const categoryButtons = wrapper.findAll('.category-item');
        expect(categoryButtons.length).toBeGreaterThan(0);

        await categoryButtons[1].trigger('click');
        await flushPromises();

        // 验证分类API被调用
        expect(require('@/api/bookApi').default.getBooksByCategory).toHaveBeenCalled();
    });

    it('点击书籍跳转到详情页', async () => {
        // 渲染书籍后触发点击事件
        await wrapper.vm.handleBookClick('1');

        // 验证路由跳转
        expect(router.push).toHaveBeenCalledWith({
            path: `/book/1`
        });
    });

    it('加载更多功能正常工作', async () => {
        // 初始调用次数
        const initialCallCount = require('@/api/bookApi').default.getRecommendBooks.mock.calls.length;

        // 触发加载更多
        await wrapper.find('.load-more-btn').trigger('click');
        await flushPromises();

        // 验证API再次被调用
        expect(require('@/api/bookApi').default.getRecommendBooks.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('处理搜索结果为空的情况', async () => {
        // 模拟空搜索结果
        require('@/api/bookApi').default.searchBooksByTitle.mockResolvedValueOnce({
            data: {
                code: 1,
                data: []
            }
        });

        // 执行搜索
        await wrapper.find('.search-input').setValue('无结果搜索');
        await wrapper.find('.search-button').trigger('click');
        await flushPromises();

        // 验证空结果提示显示
        expect(wrapper.find('.empty-result').exists()).toBe(true);
    });
}); 