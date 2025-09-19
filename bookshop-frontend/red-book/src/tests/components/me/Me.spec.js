import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import Me from '@/components/me/Me.vue';

// 模拟依赖
vi.mock('pinia', () => ({
    storeToRefs: vi.fn().mockImplementation(() => ({
        userThing: {
            value: {
                username: '测试用户',
                email: 'test@example.com',
                id: '1',
                gender: '男',
                introduction: '这是测试简介',
                avatar_base64: 'mock_avatar_data'
            }
        }
    }))
}));

vi.mock('@/store/user', () => ({
    userInfoStore: vi.fn().mockImplementation(() => ({
        userThing: {
            username: '测试用户',
            email: 'test@example.com',
            id: '1',
            gender: '男',
            introduction: '这是测试简介',
            avatar_base64: 'mock_avatar_data'
        }
    }))
}));

vi.mock('@/api/likeStarApi', () => ({
    default: {
        searchCountByTargetIds: vi.fn().mockResolvedValue({
            data: { data: 10 }
        })
    }
}));

vi.mock('@/api/subscriptApi', () => ({
    default: {
        getUserIdbyTargetId: vi.fn().mockResolvedValue({
            data: { data: Array(5).fill({ user_id: '123' }) }
        }),
        getTargetId: vi.fn().mockResolvedValue({
            data: { data: Array(3).fill({ target_id: '456' }) }
        })
    }
}));

vi.mock('@/api/articleApi', () => ({
    default: {
        getArticlesByAuthorId: vi.fn().mockResolvedValue({
            data: {
                data: [
                    { article_id: '1', title: '测试文章1' },
                    { article_id: '2', title: '测试文章2' }
                ]
            }
        })
    }
}));

// 创建路由
const routes = [
    { path: '/Me', component: { template: '<div>Me</div>' } },
    { path: '/Me/Note', component: { template: '<div>Note</div>' } },
    { path: '/Me/Book', component: { template: '<div>Book</div>' } },
    { path: '/Me/StarList', component: { template: '<div>StarList</div>' } },
    { path: '/Me/LikeList', component: { template: '<div>LikeList</div>' } }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

describe('Me.vue', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(Me, {
            global: {
                plugins: [router],
                stubs: {
                    RouterLink: true,
                    RouterView: true,
                    EditProfile: true,
                }
            }
        });

        // 等待异步操作完成
        await flushPromises();
    });

    it('正确渲染用户信息', () => {
        expect(wrapper.find('.username').text()).toBe('测试用户');
        expect(wrapper.find('.id').text()).toContain('1');
        expect(wrapper.find('.intro').text()).toContain('这是测试简介');
    });

    it('正确渲染统计信息', () => {
        expect(wrapper.find('.subscript-thing').text()).toContain('关注 3');
        expect(wrapper.find('.subscript-thing').text()).toContain('粉丝 5');
        expect(wrapper.find('.subscript-thing').text()).toContain('获赞与收藏 10');
    });

    it('点击编辑图标显示编辑对话框', async () => {
        expect(wrapper.find('.edit-profile-overlay').exists()).toBe(false);

        await wrapper.find('.edit-icon').trigger('click');

        expect(wrapper.find('.edit-profile-overlay').exists()).toBe(true);
    });

    it('包含正确的导航链接', () => {
        const links = wrapper.findAll('.Lbutton');
        expect(links.length).toBe(4);

        const hrefs = links.map(link => link.attributes('to'));
        expect(hrefs).toContain('/Me/Note');
        expect(hrefs).toContain('/Me/Book');
        expect(hrefs).toContain('/Me/StarList');
        expect(hrefs).toContain('/Me/LikeList');
    });

    it('正确处理关闭编辑对话框', async () => {
        // 先打开对话框
        await wrapper.find('.edit-icon').trigger('click');
        expect(wrapper.find('.edit-profile-overlay').exists()).toBe(true);

        // 触发关闭事件
        await wrapper.findComponent({ name: 'EditProfile' }).vm.$emit('close');

        // 对话框应该关闭
        expect(wrapper.find('.edit-profile-overlay').exists()).toBe(false);
    });
}); 