import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useRouter } from 'vue-router';
import Register from '@/components/login/Register.vue';

// 模拟 userApi
vi.mock('@/api/userApi', () => ({
    default: {
        register: vi.fn().mockResolvedValue({
            data: {
                code: 1,
                msg: '注册成功'
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

// 模拟 formValidation
vi.mock('@/utils/formValidation', () => ({
    validateRegisterForm: vi.fn().mockImplementation((formData) => {
        const errors = [];
        if (!formData.username) errors.push('用户名不能为空');
        if (!formData.account) errors.push('账号不能为空');
        if (!formData.email) errors.push('邮箱不能为空');
        if (!formData.password) errors.push('密码不能为空');
        if (!formData.confirmPassword) errors.push('确认密码不能为空');
        if (formData.password !== formData.confirmPassword) errors.push('两次密码不一致');
        if (!formData.gender) errors.push('请选择性别');

        return {
            valid: errors.length === 0,
            errors
        };
    })
}));

describe('Register.vue', () => {
    let wrapper;
    const router = useRouter();

    beforeEach(() => {
        vi.clearAllMocks();
        wrapper = mount(Register, {
            global: {
                stubs: {
                    RouterLink: true,
                    ElMessage: true
                }
            }
        });
    });

    it('正确渲染注册表单', () => {
        expect(wrapper.find('.register-container').exists()).toBe(true);
        expect(wrapper.find('input[name="username"]').exists()).toBe(true);
        expect(wrapper.find('input[name="account"]').exists()).toBe(true);
        expect(wrapper.find('input[name="email"]').exists()).toBe(true);
        expect(wrapper.find('input[name="password"]').exists()).toBe(true);
        expect(wrapper.find('input[name="confirmPassword"]').exists()).toBe(true);
        expect(wrapper.find('.gender-options').exists()).toBe(true);
        expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    });

    it('表单字段绑定正确', async () => {
        await wrapper.find('input[name="username"]').setValue('测试用户');
        await wrapper.find('input[name="account"]').setValue('testaccount');
        await wrapper.find('input[name="email"]').setValue('test@example.com');
        await wrapper.find('input[name="password"]').setValue('password123');
        await wrapper.find('input[name="confirmPassword"]').setValue('password123');

        const genderRadios = wrapper.findAll('input[type="radio"]');
        await genderRadios[0].setValue('男');
        await genderRadios[0].setChecked(true);

        expect(wrapper.vm.formData.username).toBe('测试用户');
        expect(wrapper.vm.formData.account).toBe('testaccount');
        expect(wrapper.vm.formData.email).toBe('test@example.com');
        expect(wrapper.vm.formData.password).toBe('password123');
        expect(wrapper.vm.formData.confirmPassword).toBe('password123');
        expect(wrapper.vm.formData.gender).toBe('男');
    });

    it('提交表单时进行验证', async () => {
        // 填写表单
        await wrapper.find('input[name="username"]').setValue('测试用户');
        await wrapper.find('input[name="account"]').setValue('testaccount');
        await wrapper.find('input[name="email"]').setValue('test@example.com');
        await wrapper.find('input[name="password"]').setValue('password123');
        await wrapper.find('input[name="confirmPassword"]').setValue('password123');

        const genderRadios = wrapper.findAll('input[type="radio"]');
        await genderRadios[0].setValue('男');
        await genderRadios[0].setChecked(true);

        // 模拟上传头像
        wrapper.vm.formData.avatar = 'mock_avatar_base64';

        // 提交表单
        await wrapper.find('form').trigger('submit');

        // 验证是否调用了注册API
        expect(require('@/api/userApi').default.register).toHaveBeenCalled();

        // 验证成功后应该跳转到登录页
        expect(router.push).toHaveBeenCalledWith('/login');
    });

    it('点击登录链接正确跳转', () => {
        const loginLink = wrapper.find('a[href="/login"]');
        expect(loginLink.exists()).toBe(true);
    });
}); 