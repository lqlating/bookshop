import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UserList from '@/components/discover/UserList.vue';

describe('UserList.vue', () => {
    let wrapper;

    const mockUsers = [
        {
            user_id: '1',
            username: '用户一',
            avatar_base64: 'mock_avatar_1',
            introduction: '这是用户一的简介'
        },
        {
            user_id: '2',
            username: '用户二',
            avatar_base64: 'mock_avatar_2',
            introduction: '这是用户二的简介'
        },
        {
            user_id: '3',
            username: '用户三',
            avatar_base64: 'mock_avatar_3',
            introduction: '这是用户三的简介'
        }
    ];

    beforeEach(() => {
        wrapper = mount(UserList, {
            props: {
                users: mockUsers
            }
        });
    });

    it('正确渲染用户列表', () => {
        expect(wrapper.find('.user-list').exists()).toBe(true);

        const userItems = wrapper.findAll('.user-item');
        expect(userItems.length).toBe(mockUsers.length);
    });

    it('每个用户项显示正确信息', () => {
        const userItems = wrapper.findAll('.user-item');

        mockUsers.forEach((user, index) => {
            const userItem = userItems[index];
            expect(userItem.find('.username').text()).toBe(user.username);
            expect(userItem.find('.introduction').text()).toContain(user.introduction);

            const avatar = userItem.find('.avatar');
            expect(avatar.exists()).toBe(true);
            expect(avatar.attributes('src')).toContain(user.avatar_base64);
        });
    });

    it('点击用户项触发选择事件', async () => {
        const firstUserItem = wrapper.findAll('.user-item')[0];
        await firstUserItem.trigger('click');

        expect(wrapper.emitted('select-user')).toBeTruthy();
        expect(wrapper.emitted('select-user')[0][0]).toEqual(mockUsers[0]);
    });

    it('没有用户时显示空状态', async () => {
        const emptyWrapper = mount(UserList, {
            props: {
                users: []
            }
        });

        expect(emptyWrapper.find('.empty-state').exists()).toBe(true);
        expect(emptyWrapper.find('.empty-state').text()).toContain('没有找到用户');
    });

    it('用户列表更新时重新渲染', async () => {
        // 更新用户列表
        const updatedUsers = [
            ...mockUsers,
            {
                user_id: '4',
                username: '用户四',
                avatar_base64: 'mock_avatar_4',
                introduction: '这是用户四的简介'
            }
        ];

        await wrapper.setProps({ users: updatedUsers });

        const userItems = wrapper.findAll('.user-item');
        expect(userItems.length).toBe(updatedUsers.length);
    });
}); 