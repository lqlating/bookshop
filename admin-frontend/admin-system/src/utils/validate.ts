// 表单验证规则
export const rules = {
  required: (message = '此项必填') => ({
    required: true,
    message,
    trigger: 'blur'
  }),
  email: {
    type: 'email',
    message: '请输入正确的邮箱地址',
    trigger: ['blur', 'change']
  },
  length: (min: number, max: number) => ({
    min,
    max,
    message: `长度应在 ${min} 到 ${max} 个字符之间`,
    trigger: 'blur'
  })
}
