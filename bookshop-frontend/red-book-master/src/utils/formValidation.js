/**
 * 表单验证规则
 */
import { ElMessage } from 'element-plus';

// 脏话和敏感词列表（中英文）
const dirtyWords = [
    // 中文脏话
    '傻逼', '贱人', '妈的', '操', '草', '垃圾', '废物', '滚蛋', '去死', '白痴',
    '蠢货', '混蛋', '王八蛋', '狗娘养', '贱货', '婊子', '妓女', '娘炮', '牛逼',
    '逼', '屌', '鸡巴', '日你', '尼玛', '你妈', '骚', '贱', '死',

    // 英文脏话
    'fuck', 'shit', 'bitch', 'ass', 'asshole', 'damn', 'cunt', 'dick', 'cock',
    'pussy', 'slut', 'whore', 'bastard', 'motherfucker', 'tits', 'boobs',
    'nigger', 'faggot', 'retard', 'idiot', 'stupid', 'dumb'
];

/**
 * 邮箱格式验证
 * @param {string} email - 电子邮箱地址
 * @returns {boolean} - 是否通过验证
 */
export const validateEmail = (email) => {
    // 标准的邮箱正则表达式
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

/**
 * 密码强度验证
 * @param {string} password - 密码
 * @returns {object} - 验证结果和消息
 */
export const validatePassword = (password) => {
    // 至少8位，至少包含一个字母和一个数字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    let msg = '';
    let valid = true;

    if (!password) {
        msg = '密码不能为空';
        valid = false;
    } else if (password.length < 8) {
        msg = '密码长度至少为8位';
        valid = false;
    } else if (!passwordRegex.test(password)) {
        msg = '密码必须包含至少一个字母和一个数字';
        valid = false;
    }

    return { valid, msg };
};

/**
 * 确认密码验证
 * @param {string} password - 密码
 * @param {string} confirmPassword - 确认密码
 * @returns {object} - 验证结果和消息
 */
export const validateConfirmPassword = (password, confirmPassword) => {
    let msg = '';
    let valid = true;

    if (!confirmPassword) {
        msg = '请确认密码';
        valid = false;
    } else if (password !== confirmPassword) {
        msg = '两次输入的密码不一致';
        valid = false;
    }

    return { valid, msg };
};

/**
 * 用户名验证（含脏话过滤）
 * @param {string} username - 用户名
 * @returns {object} - 验证结果和消息
 */
export const validateUsername = (username) => {
    let msg = '';
    let valid = true;

    if (!username) {
        msg = '用户名不能为空';
        valid = false;
    } else if (username.length < 2) {
        msg = '用户名长度至少为2位';
        valid = false;
    } else if (username.length > 20) {
        msg = '用户名长度不能超过20位';
        valid = false;
    } else {
        // 检查是否包含脏话
        const lowerUsername = username.toLowerCase();
        for (const word of dirtyWords) {
            if (lowerUsername.includes(word.toLowerCase())) {
                msg = '用户名包含不适当的内容，请重新输入';
                valid = false;
                break;
            }
        }
    }

    return { valid, msg };
};

/**
 * 账号格式验证
 * @param {string} account - 账号
 * @returns {object} - 验证结果和消息
 */
export const validateAccount = (account) => {
    let msg = '';
    let valid = true;

    if (!account) {
        msg = '账号不能为空';
        valid = false;
    } else if (account.length < 4) {
        msg = '账号长度至少为4位';
        valid = false;
    } else if (account.length > 20) {
        msg = '账号长度不能超过20位';
        valid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(account)) {
        msg = '账号只能包含字母、数字和下划线';
        valid = false;
    }

    return { valid, msg };
};

/**
 * 验证注册表单
 * @param {object} formData - 表单数据
 * @returns {object} - 验证结果和错误消息数组
 */
export const validateRegisterForm = (formData) => {
    const errors = [];

    // 用户名验证
    const usernameResult = validateUsername(formData.username);
    if (!usernameResult.valid) {
        errors.push(usernameResult.msg);
    }

    // 账号验证
    const accountResult = validateAccount(formData.account);
    if (!accountResult.valid) {
        errors.push(accountResult.msg);
    }

    // 邮箱验证
    if (!validateEmail(formData.email)) {
        errors.push('邮箱格式不正确');
    }

    // 密码验证
    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.valid) {
        errors.push(passwordResult.msg);
    }

    // 确认密码验证
    const confirmPasswordResult = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmPasswordResult.valid) {
        errors.push(confirmPasswordResult.msg);
    }

    // 性别验证
    if (!formData.gender) {
        errors.push('请选择性别');
    }

    // 头像验证
    if (!formData.avatar) {
        errors.push('请上传头像');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * 检测文本是否包含脏话
 * @param {string} text - 要检测的文本
 * @returns {boolean} - 是否包含脏话
 */
export const containsDirtyWords = (text) => {
    if (!text) return false;

    const lowerText = text.toLowerCase();
    for (const word of dirtyWords) {
        if (lowerText.includes(word.toLowerCase())) {
            return true;
        }
    }

    return false;
};

/**
 * 过滤文本中的脏话（用*替代）
 * @param {string} text - 要过滤的文本
 * @returns {string} - 过滤后的文本
 */
export const filterDirtyWords = (text) => {
    if (!text) return '';

    let filteredText = text;
    dirtyWords.forEach(word => {
        if (filteredText.toLowerCase().includes(word.toLowerCase())) {
            // 创建正则表达式进行替换，'i'表示不区分大小写
            const regex = new RegExp(word, 'gi');
            // 替换为相同长度的*
            filteredText = filteredText.replace(regex, match => '*'.repeat(match.length));
        }
    });

    return filteredText;
};

export default {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateUsername,
    validateAccount,
    validateRegisterForm,
    containsDirtyWords,
    filterDirtyWords,
    dirtyWords
}; 