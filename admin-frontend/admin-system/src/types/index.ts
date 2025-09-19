// 通用响应类型
export interface Response<T = any> {
  code: number
  data: T
  message: string
}

// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  registerDate: string
  status: string
}

// 书籍相关类型
export interface Book {
  id: number
  title: string
  author: string
  status: string
}

// 文章相关类型
export interface Article {
  id: number
  title: string
  author: string
  date: string
  status: string
}

// 评论相关类型
export interface Comment {
  id: number
  content: string
  user: string
  target: string
  date: string
  status: string
}

// 分页参数类型
export interface PageParams {
  page: number
  pageSize: number
}

// 状态类型
export type Status = 'normal' | 'pending' | 'reported'
