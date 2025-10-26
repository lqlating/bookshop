import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Comment from '@/components/comment/Comment.vue';

// 模拟依赖
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

vi.mock('@/api/commentApi', () => ({
    default: {
        getCommentList: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                data: [
                    {
                        comment_id: '101',
                        user_id: '1',
                        username: '测试用户',
                        avatar_base64: 'mock_avatar_data',
                        content: '这是一条测试评论',
                        create_time: '2023-05-01 10:00:00',
                        like_count: 5,
                        replies: []
                    },
                    {
                        comment_id: '102',
                        user_id: '2',
                        username: '其他用户',
                        avatar_base64: 'other_avatar_data',
                        content: '这是另一条测试评论',
                        create_time: '2023-05-01 11:00:00',
                        like_count: 3,
                        replies: [
                            {
                                reply_id: '201',
                                user_id: '3',
                                username: '回复用户',
                                avatar_base64: 'reply_avatar_data',
                                content: '这是一条回复',
                                create_time: '2023-05-01 12:00:00',
                                to_user_id: '2',
                                to_username: '其他用户'
                            }
                        ]
                    }
                ]
            }
        }),
        addComment: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                msg: '评论成功'
            }
        }),
        deleteComment: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                msg: '删除成功'
            }
        })
    }
}));

vi.mock('element-plus', () => ({
    ElMessage: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn()
    }
}));

describe('Comment.vue', () => {
    let wrapper;

    const mockProps = {
        targetId: '999', // 文章ID
        targetType: 'article'
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(Comment, {
            props: mockProps,
            global: {
                stubs: {
                    ElMessage: true,
                    replyPart: true
                }
            }
        });

        // 等待异步操作完成
        await flushPromises();
    });

    it('正确渲染评论组件', () => {
        expect(wrapper.find('.comment-container').exists()).toBe(true);
        expect(wrapper.find('.comment-input').exists()).toBe(true);
        expect(wrapper.find('.comment-list').exists()).toBe(true);
    });

    it('初始化时加载评论列表', async () => {
        expect(require('@/api/commentApi').default.getCommentList).toHaveBeenCalledWith(mockProps.targetId, mockProps.targetType);

        // 检查评论是否被渲染
        const commentItems = wrapper.findAll('.comment-item');
        expect(commentItems.length).toBe(2); // 两条评论
    });

    it('提交评论功能正常工作', async () => {
        // 输入评论内容
        const commentInput = wrapper.find('.comment-input textarea');
        await commentInput.setValue('这是一条新评论');

        // 点击提交按钮
        await wrapper.find('.submit-btn').trigger('click');

        // 验证提交API被调用
        expect(require('@/api/commentApi').default.addComment).toHaveBeenCalled();
        const callArgs = require('@/api/commentApi').default.addComment.mock.calls[0][0];
        expect(callArgs.target_id).toBe(mockProps.targetId);
        expect(callArgs.target_type).toBe(mockProps.targetType);
        expect(callArgs.content).toBe('这是一条新评论');
    });

    it('回复评论功能正常工作', async () => {
        // 点击回复按钮
        const replyButtons = wrapper.findAll('.reply-btn');
        await replyButtons[0].trigger('click');

        // 验证回复框打开
        expect(wrapper.find('.reply-input').exists()).toBe(true);

        // 输入回复内容
        await wrapper.find('.reply-input textarea').setValue('这是一条回复');

        // 提交回复
        await wrapper.find('.submit-reply-btn').trigger('click');

        // 验证提交API被调用
        expect(require('@/api/commentApi').default.addComment).toHaveBeenCalled();
    });

    it('删除评论功能正常工作', async () => {
        // 自己的评论应该有删除按钮（第一条评论是自己的）
        const deleteButtons = wrapper.findAll('.delete-btn');
        expect(deleteButtons.length).toBeGreaterThan(0);

        // 点击删除按钮
        await deleteButtons[0].trigger('click');

        // 确认删除
        await wrapper.find('.confirm-delete-btn').trigger('click');

        // 验证删除API被调用
        expect(require('@/api/commentApi').default.deleteComment).toHaveBeenCalled();
    });

    it('点赞功能正常工作', async () => {
        // 点击点赞按钮
        const likeButtons = wrapper.findAll('.like-btn');
        await likeButtons[0].trigger('click');

        // 验证点赞组件被触发
        expect(wrapper.findComponent({ name: 'like_comment' }).exists()).toBe(true);
    });

    it('评论列表为空时显示空状态', async () => {
        // 模拟空评论列表
        require('@/api/commentApi').default.getCommentList.mockResolvedValueOnce({
            data: {
                code: 1,
                data: []
            }
        });

        const emptyWrapper = mount(Comment, {
            props: mockProps,
            global: {
                stubs: {
                    ElMessage: true,
                    replyPart: true
                }
            }
        });

        await flushPromises();

        // 检查空状态提示
        expect(emptyWrapper.find('.empty-comment').exists()).toBe(true);
        expect(emptyWrapper.find('.empty-comment').text()).toContain('暂无评论');
    });
}); 