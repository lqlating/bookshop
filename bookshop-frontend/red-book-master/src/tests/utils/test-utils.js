import { mount } from '@vue/test-utils';

/**
 * 扩展mount方法，添加更多选项
 * @param {Component} component - 要挂载的组件
 * @param {Object} options - 挂载选项
 * @returns {Wrapper} - 组件包装器
 */
export function mountWithOptions(component, options = {}) {
    return mount(component, {
        global: {
            stubs: {
                RouterLink: true,
                RouterView: true,
                ElMessage: true,
                ...options.stubs,
            },
            mocks: {
                $route: {
                    params: {},
                    query: {},
                    path: '/',
                    ...options.route,
                },
                ...options.mocks,
            },
            ...options.global,
        },
        ...options,
    });
}

/**
 * 创建 Pinia 存储的模拟数据
 * @param {Object} initialState - 初始状态
 * @returns {Object} - 模拟的存储
 */
export function createMockStore(initialState = {}) {
    return {
        state: { ...initialState },
        getters: {},
        actions: {},
        dispatch: vi.fn(),
        commit: vi.fn(),
    };
}

/**
 * 等待组件渲染完成
 * @param {number} ms - 等待的毫秒数
 * @returns {Promise} - Promise
 */
export function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 查找所有匹配选择器的元素并映射它们的文本内容
 * @param {Wrapper} wrapper - 组件包装器
 * @param {string} selector - CSS选择器
 * @returns {Array} - 文本内容数组
 */
export function findAllTexts(wrapper, selector) {
    return wrapper.findAll(selector).map(node => node.text());
}

/**
 * 模拟异步操作
 * @param {Function} fn - 要模拟的函数
 * @param {*} returnValue - 返回值
 * @returns {Function} - 模拟的异步函数
 */
export function mockAsync(fn, returnValue) {
    return vi.fn().mockImplementation(() => Promise.resolve(returnValue));
} 