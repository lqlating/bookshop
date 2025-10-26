import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useRouter } from 'vue-router';
import ArticleDisplay from '@/components/discover/ArticleDisplay.vue';

// 模拟 router
vi.mock('vue-router', () => ({
    useRouter: vi.fn().mockReturnValue({
        push: vi.fn()
    })
}));

describe('ArticleDisplay.vue', () => {
    let wrapper;
    const router = useRouter();

    const mockArticle = {
        article_id: '1',
        title: '测试文章标题',
        content: '这是测试文章的内容，包含了一些文字描述。',
        author_id: '101',
        author_name: '测试作者',
        preview_image: 'test-image.jpg',
        create_time: '2023-05-01'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        wrapper = mount(ArticleDisplay, {
            props: {
                article: mockArticle
            }
        });
    });

    it('正确渲染文章卡片', () => {
        expect(wrapper.find('.article-card').exists()).toBe(true);
        expect(wrapper.find('.article-title').text()).toBe(mockArticle.title);
        expect(wrapper.find('.article-content').text()).toContain(mockArticle.content);
        expect(wrapper.find('.author-name').text()).toBe(mockArticle.author_name);
    });

    it('图片预览正确显示', () => {
        const previewImage = wrapper.find('.preview-image');
        expect(previewImage.exists()).toBe(true);
        expect(previewImage.attributes('src')).toContain(mockArticle.preview_image);
    });

    it('点击文章卡片跳转到文章详情页', async () => {
        await wrapper.find('.article-card').trigger('click');
        expect(router.push).toHaveBeenCalledWith({
            path: `/article/${mockArticle.article_id}`
        });
    });

    it('截断过长的内容', () => {
        // 创建一个内容很长的文章
        const longContentArticle = {
            ...mockArticle,
            content: '这是一段非常长的内容，用于测试内容截断功能。'.repeat(10)
        };

        const longContentWrapper = mount(ArticleDisplay, {
            props: {
                article: longContentArticle
            }
        });

        // 检查内容是否被截断
        expect(longContentWrapper.find('.article-content').text().length).toBeLessThan(longContentArticle.content.length);
        expect(longContentWrapper.find('.article-content').text()).toContain('...');
    });

    it('正确格式化日期', () => {
        expect(wrapper.find('.create-time').exists()).toBe(true);
        // 检查日期是否被格式化，具体格式取决于组件实现
        expect(wrapper.find('.create-time').text()).not.toBe(mockArticle.create_time);
    });
}); 