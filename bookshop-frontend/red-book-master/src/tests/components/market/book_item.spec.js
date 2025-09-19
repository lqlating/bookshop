import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import book_item from '@/components/market/book_item/book_item.vue';

describe('book_item.vue', () => {
    let wrapper;

    const mockBook = {
        book_id: '1',
        title: '测试书籍',
        author: '测试作者',
        price: 39.9,
        cover_image: 'test-cover.jpg',
        description: '这是一本测试书籍的描述',
        tags: ['文学', '小说']
    };

    beforeEach(() => {
        wrapper = mount(book_item, {
            props: {
                book: mockBook
            }
        });
    });

    it('正确渲染书籍项', () => {
        expect(wrapper.find('.book-item').exists()).toBe(true);
        expect(wrapper.find('.book-title').text()).toBe(mockBook.title);
        expect(wrapper.find('.book-author').text()).toContain(mockBook.author);
        expect(wrapper.find('.book-price').text()).toContain(mockBook.price.toString());
    });

    it('封面图片正确显示', () => {
        const coverImage = wrapper.find('.book-cover');
        expect(coverImage.exists()).toBe(true);
        expect(coverImage.attributes('src')).toContain(mockBook.cover_image);
    });

    it('点击书籍项触发点击事件', async () => {
        await wrapper.find('.book-item').trigger('click');

        // 验证是否发出了点击事件
        expect(wrapper.emitted('book-click')).toBeTruthy();
        expect(wrapper.emitted('book-click')[0][0]).toBe(mockBook.book_id);
    });

    it('正确渲染标签', () => {
        const tags = wrapper.findAll('.book-tag');
        expect(tags.length).toBe(mockBook.tags.length);

        mockBook.tags.forEach((tag, index) => {
            expect(tags[index].text()).toBe(tag);
        });
    });

    it('处理封面图片加载失败', async () => {
        // 模拟默认图片
        const defaultImageUrl = 'default-cover.jpg';

        // 找到图片元素
        const coverImage = wrapper.find('.book-cover');

        // 触发图片加载失败事件
        await coverImage.trigger('error');

        // 验证是否使用了默认图片
        expect(coverImage.attributes('src')).toContain(defaultImageUrl);
    });

    it('格式化价格显示', () => {
        const formattedPrice = wrapper.find('.book-price').text();
        expect(formattedPrice).toMatch(/￥\s*\d+\.\d{2}/); // 例如 "￥ 39.90"
    });

    it('截断过长的书名', () => {
        // 创建一个书名很长的测试数据
        const longTitleBook = {
            ...mockBook,
            title: '这是一个非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的书名'
        };

        const longTitleWrapper = mount(book_item, {
            props: {
                book: longTitleBook
            }
        });

        const displayedTitle = longTitleWrapper.find('.book-title').text();
        expect(displayedTitle.length).toBeLessThan(longTitleBook.title.length);
