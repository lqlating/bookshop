import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ElMessage } from 'element-plus';
import EditProfile from '@/components/profile/EditProfile.vue';

// 模拟依赖
vi.mock('element-plus', () => ({
    ElMessage: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
    }
}));

vi.mock('@/api/userApi', () => ({
    default: {
        updateUserInfo: vi.fn().mockResolvedValue({
            data: { code: 1, msg: 'success' }
        })
    }
}));

vi.mock('@/utils/formValidation', () => ({
    validateUsername: vi.fn().mockImplementation((username) => {
        if (username.length < 2) {
            return { valid: false, msg: '用户名长度至少为2位' };
        }
        return { valid: true, msg: '' };
    }),
    validateEmail: vi.fn().mockImplementation((email) => {
        return email.includes('@');
    }),
    containsDirtyWords: vi.fn().mockImplementation((text) => {
        // 检查是否包含模拟的违禁词
        return text && text.includes('违禁词');
    }),
    filterDirtyWords: vi.fn().mockImplementation((text) => {
        // 如果包含违禁词，将其替换为星号
        return text ? text.replace('违禁词', '***') : '';
    })
}));

vi.mock('@/store/user', () => ({
    userInfoStore: vi.fn().mockImplementation(() => ({
        setUserInfo: vi.fn()
    }))
}));

describe('EditProfile.vue', () => {
    let wrapper;
    const mockProps = {
        userData: {
            id: '1',
            username: '测试用户',
            email: 'test@example.com',
            gender: '男',
            introduction: '这是一个测试简介',
            avatar_base64: 'base64_mock_data'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        wrapper = mount(EditProfile, {
            props: mockProps,
            global: {
                stubs: {
                    // 模拟全局组件
                    ElMessage: true
                }
            }
        });
    });

    it('正确渲染组件', () => {
        expect(wrapper.find('.edit-profile-container').exists()).toBe(true);
        expect(wrapper.find('input[type="text"]').element.value).toBe('测试用户');
        expect(wrapper.find('input[type="email"]').element.value).toBe('test@example.com');
        expect(wrapper.find('textarea').element.value).toBe('这是一个测试简介');
    });

    it('用户输入包含违禁词时禁用提交按钮', async () => {
        // 初始状态下按钮应该是启用的
        expect(wrapper.find('.update-btn').attributes('disabled')).toBeFalsy();

        // 修改用户名为包含违禁词的文本
        await wrapper.find('input[type="text"]').setValue('违禁词测试');
        await wrapper.find('input[type="text"]').trigger('input');

        // 验证按钮被禁用
        expect(wrapper.find('.update-btn').attributes('disabled')).toBeTruthy();
        expect(wrapper.find('.update-btn').classes()).toContain('disabled-btn');

        // 验证错误消息显示
        expect(wrapper.find('.error-message').text()).toContain('用户名包含不适当内容');
    });

    it('表单验证失败时禁用提交按钮', async () => {
        // 清空必填字段
        await wrapper.find('input[type="text"]').setValue('');
        await wrapper.find('input[type="text"]').trigger('input');

        // 验证按钮被禁用
        expect(wrapper.find('.update-btn').attributes('disabled')).toBeTruthy();
    });

    it('成功提交表单时发出update-success事件', async () => {
        // 修改用户名
        await wrapper.find('input[type="text"]').setValue('新用户名');
        await wrapper.find('input[type="text"]').trigger('input');

        // 点击提交按钮
        await wrapper.find('.update-btn').trigger('click');

        // 验证事件被触发
        expect(wrapper.emitted('update-success')).toBeTruthy();
    });

    it('点击关闭按钮时发出close事件', async () => {
        await wrapper.find('.close-btn').trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
    });
}); 