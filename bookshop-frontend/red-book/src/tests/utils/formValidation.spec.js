import { describe, it, expect, vi } from 'vitest';
import {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateUsername,
    validateAccount,
    containsDirtyWords,
    filterDirtyWords
} from '@/utils/formValidation';

describe('表单验证工具', () => {
    describe('validateEmail', () => {
        it('有效的邮箱地址返回 true', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('user+tag@example.org')).toBe(true);
        });

        it('无效的邮箱地址返回 false', () => {
            expect(validateEmail('test')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('test@example')).toBe(false);
            expect(validateEmail('')).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('有效的密码返回 { valid: true }', () => {
            expect(validatePassword('password123')).toEqual({ valid: true, msg: '' });
            expect(validatePassword('Pass1234')).toEqual({ valid: true, msg: '' });
        });

        it('空密码返回错误消息', () => {
            const result = validatePassword('');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('密码不能为空');
        });

        it('密码长度小于8位返回错误消息', () => {
            const result = validatePassword('pass1');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('密码长度至少为8位');
        });

        it('不包含字母和数字的密码返回错误消息', () => {
            const result = validatePassword('12345678');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('密码必须包含至少一个字母和一个数字');
        });
    });

    describe('validateConfirmPassword', () => {
        it('两次密码输入一致返回 { valid: true }', () => {
            expect(validateConfirmPassword('password123', 'password123')).toEqual({ valid: true, msg: '' });
        });

        it('确认密码为空返回错误消息', () => {
            const result = validateConfirmPassword('password123', '');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('请确认密码');
        });

        it('两次密码输入不一致返回错误消息', () => {
            const result = validateConfirmPassword('password123', 'password456');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('两次输入的密码不一致');
        });
    });

    describe('validateUsername', () => {
        it('有效的用户名返回 { valid: true }', () => {
            expect(validateUsername('用户名')).toEqual({ valid: true, msg: '' });
            expect(validateUsername('UserName')).toEqual({ valid: true, msg: '' });
        });

        it('空用户名返回错误消息', () => {
            const result = validateUsername('');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('用户名不能为空');
        });

        it('用户名长度小于2位返回错误消息', () => {
            const result = validateUsername('u');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('用户名长度至少为2位');
        });

        it('用户名长度大于20位返回错误消息', () => {
            const result = validateUsername('u'.repeat(21));
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('用户名长度不能超过20位');
        });

        it('用户名包含脏话返回错误消息', () => {
            // 这假设 dirtyWords 数组中包含 'fuck'
            const result = validateUsername('user_fuck');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('用户名包含不适当的内容');
        });
    });

    describe('validateAccount', () => {
        it('有效的账号返回 { valid: true }', () => {
            expect(validateAccount('account123')).toEqual({ valid: true, msg: '' });
            expect(validateAccount('user_name')).toEqual({ valid: true, msg: '' });
        });

        it('空账号返回错误消息', () => {
            const result = validateAccount('');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('账号不能为空');
        });

        it('账号长度小于4位返回错误消息', () => {
            const result = validateAccount('abc');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('账号长度至少为4位');
        });

        it('账号长度大于20位返回错误消息', () => {
            const result = validateAccount('a'.repeat(21));
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('账号长度不能超过20位');
        });

        it('包含特殊字符的账号返回错误消息', () => {
            const result = validateAccount('account@123');
            expect(result.valid).toBe(false);
            expect(result.msg).toContain('账号只能包含字母、数字和下划线');
        });
    });

    describe('containsDirtyWords', () => {
        it('文本包含脏话返回 true', () => {
            // 这假设 dirtyWords 数组中包含这些词
            expect(containsDirtyWords('这是一个fuck测试')).toBe(true);
            expect(containsDirtyWords('shit happens')).toBe(true);
        });

        it('文本不包含脏话返回 false', () => {
            expect(containsDirtyWords('这是一个正常文本')).toBe(false);
            expect(containsDirtyWords('Hello World')).toBe(false);
        });

        it('空文本返回 false', () => {
            expect(containsDirtyWords('')).toBe(false);
            expect(containsDirtyWords(null)).toBe(false);
            expect(containsDirtyWords(undefined)).toBe(false);
        });
    });

    describe('filterDirtyWords', () => {
        it('替换文本中的脏话为星号', () => {
            // 假设 'fuck' 是一个脏话
            expect(filterDirtyWords('这是一个fuck测试')).toMatch(/这是一个\*\*\*\*测试/);

            // 假设 'shit' 是一个脏话
            expect(filterDirtyWords('shit happens')).toMatch(/\*\*\*\* happens/);
        });

        it('文本不包含脏话时返回原文本', () => {
            const text = '这是一个正常文本';
            expect(filterDirtyWords(text)).toBe(text);

            const text2 = 'Hello World';
            expect(filterDirtyWords(text2)).toBe(text2);
        });

        it('空文本返回空字符串', () => {
            expect(filterDirtyWords('')).toBe('');
            expect(filterDirtyWords(null)).toBe('');
            expect(filterDirtyWords(undefined)).toBe('');
        });
    });
}); 