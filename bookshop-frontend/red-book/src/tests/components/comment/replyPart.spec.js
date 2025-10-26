import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import replyPart from '@/components/comment/replyPart.vue';

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

// 模拟 commentApi
vi.mock('@/api/commentApi', () => ({
    default: {
        addReply: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                msg: '回复成功'
            }
        }),
        deleteReply: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                msg: '删除成功'
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

describe('replyPart.vue', () => {
    let wrapper;

    const mockReplies = [
        {
            reply_id: '201',
            user_id: '1', // 当前用户
            username: '测试用户',
            avatar_base64: 'mock_avatar_data',
            content: '这是我的回复',
            create_time: '2023-05-01 12:00:00',
            to_user_id: '2',
            to_username: '目标用户'
        },
        {
            reply_id: '202',
            user_id: '3', // 其他用户
            username: '其他回复者',
            avatar_base64: 'other_avatar_data',
            content: '这是其他人的回复',
            create_time: '2023-05-01 13:00:00',
            to_user_id: '1',
            to_username: '测试用户'
        }
    ];

    const mockProps = {
        commentId: '101',
        replies: mockReplies
    };

    beforeEach(() => {
        vi.clearAllMocks();
        wrapper = mount(replyPart, {
            props: mockProps,
            global: {
                stubs: {
                    ElMessage: true
                }
            }
        });
    });

    it('正确渲染回复列表', () => {
        expect(wrapper.find('.reply-list').exists()).toBe(true);

        const replyItems = wrapper.findAll('.reply-item');
        expect(replyItems.length).toBe(mockReplies.length);
    });

    it('回复项展示正确的用户信息和内容', () => {
        const replyItems = wrapper.findAll('.reply-item');

        // 检查第一条回复
        expect(replyItems[0].find('.reply-username').text()).toBe(mockReplies[0].username);
        expect(replyItems[0].find('.reply-content').text()).toContain(mockReplies[0].content);
        expect(replyItems[0].find('.to-username').text()).toContain(mockReplies[0].to_username);

        // 用户自己的回复应该有删除按钮
        expect(replyItems[0].find('.delete-reply-btn').exists()).toBe(true);

        // 其他用户的回复没有删除按钮
        expect(replyItems[1].find('.delete-reply-btn').exists()).toBe(false);
    });

    it('点击回复按钮显示回复输入框', async () => {
        // 初始状态下回复输入框不可见
        expect(wrapper.find('.reply-input').exists()).toBe(false);

        // 点击回复按钮
        await wrapper.findAll('.reply-btn')[1].trigger('click');

        // 回复输入框变为可见
        expect(wrapper.find('.reply-input').exists()).toBe(true);

        // 检查回复框中的提示文本
        expect(wrapper.find('.reply-input').text()).toContain(`回复 ${mockReplies[1].username}`);
    });

    it('提交回复功能正常工作', async () => {
        // 点击回复按钮显示回复框
        await wrapper.findAll('.reply-btn')[1].trigger('click');

        // 输入回复内容
        await wrapper.find('.reply-input textarea').setValue('这是一条测试回复');

        // 提交回复
        await wrapper.find('.submit-reply-btn').trigger('click');

        // 验证API调用
        expect(require('@/api/commentApi').default.addReply).toHaveBeenCalledWith(
            expect.objectContaining({
                comment_id: mockProps.commentId,
                content: '这是一条测试回复',
                to_user_id: mockReplies[1].user_id
            })
        );
    });

    it('删除回复功能正常工作', async () => {
        // 点击自己回复的删除按钮
        await wrapper.find('.delete-reply-btn').trigger('click');

        // 确认删除
        await wrapper.find('.confirm-delete-btn').trigger('click');

        // 验证API调用
        expect(require('@/api/commentApi').default.deleteReply).toHaveBeenCalledWith(mockReplies[0].reply_id);
    });

    it('取消回复功能正常工作', async () => {
        // 点击回复按钮显示回复框
        await wrapper.findAll('.reply-btn')[1].trigger('click');

        // 验证回复框显示
        expect(wrapper.find('.reply-input').exists()).toBe(true);

        // 点击取消按钮
        await wrapper.find('.cancel-reply-btn').trigger('click');

        // 验证回复框关闭
        expect(wrapper.find('.reply-input').exists()).toBe(false);
    });

    it('回复列表为空时处理正确', async () => {
        const emptyWrapper = mount(replyPart, {
            props: {
                commentId: '101',
                replies: []
            }
        });

        // 空回复列表不应该显示回复项
        expect(emptyWrapper.findAll('.reply-item').length).toBe(0);

        // 但回复按钮应该存在，允许用户添加第一条回复
        expect(emptyWrapper.find('.add-reply-btn').exists()).toBe(true);
    });
}); 