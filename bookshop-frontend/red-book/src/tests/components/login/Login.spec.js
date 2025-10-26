import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useRouter } from 'vue-router';
import Login from '@/components/login/Login.vue';

// 模拟 userApi
vi.mock('@/api/userApi', () => ({
    default: {
        login: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                msg: '登录成功',
                data: {
                    id: '1',
                    username: '测试用户',
                    email: 'test@example.com',
                    gender: '男',
                    introduction: '这是测试简介',
                    avatar_base64: 'mock_avatar_data'
                }
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

// 模拟 userInfoStore
vi.mock('@/store/user', () => ({
    userInfoStore: vi.fn().mockImplementation(() => ({
        setUserInfo: vi.fn()
    }))
}));

describe('Login.vue', () => {
    let wrapper;
    const router = useRouter();

    beforeEach(() => {
        vi.clearAllMocks();
        wrapper = mount(Login, {
            global: {
                stubs: {
                    RouterLink: true,
                    ElMessage: true
                }
            }
        });
    });

    it('正确渲染登录表单', () => {
        expect(wrapper.find('.login-container').exists()).toBe(true);
        expect(wrapper.find('input[type="text"]').exists()).toBe(true);
        expect(wrapper.find('input[type="password"]').exists()).toBe(true);
        expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    });

    it('表单字段绑定正确', async () => {
        const accountInput = wrapper.find('input[type="text"]');
        const passwordInput = wrapper.find('input[type="password"]');

        await accountInput.setValue('testuser');
        await passwordInput.setValue('password123');

        expect(wrapper.vm.formData.account).toBe('testuser');
        expect(wrapper.vm.formData.password).toBe('password123');
    });

    it('表单验证工作正常', async () => {
        // 提交空表单应该失败
        await wrapper.find('form').trigger('submit');
        expect(router.push).not.toHaveBeenCalled();

        // 填写表单
        await wrapper.find('input[type="text"]').setValue('testuser');
        await wrapper.find('input[type="password"]').setValue('password123');

        // 提交表单
        await wrapper.find('form').trigger('submit');
        expect(router.push).toHaveBeenCalledWith('/');
    });

    it('点击注册链接正确跳转', () => {
        const registerLink = wrapper.find('a[href="/register"]');
        expect(registerLink.exists()).toBe(true);
    });
}); 