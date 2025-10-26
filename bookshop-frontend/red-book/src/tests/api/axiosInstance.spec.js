import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import axiosInstance from '@/api/axiosInstance';

vi.mock('axios', () => {
    const mockAxios = {
        create: vi.fn().mockReturnThis(),
        interceptors: {
            request: {
                use: vi.fn(),
            },
            response: {
                use: vi.fn(),
            },
        },
        defaults: {
            baseURL: '',
            headers: {},
            timeout: 0,
        },
    };
    return { default: mockAxios };
});

describe('axiosInstance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('axios.create 被正确调用，带有正确的配置', () => {
        expect(axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:8080/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    });

    it('请求拦截器被正确配置', () => {
        expect(axios.interceptors.request.use).toHaveBeenCalled();
    });

    it('响应拦截器被正确配置', () => {
        expect(axios.interceptors.response.use).toHaveBeenCalled();
    });

    it('axiosInstance应该是一个对象', () => {
        expect(typeof axiosInstance).toBe('object');
    });
}); 