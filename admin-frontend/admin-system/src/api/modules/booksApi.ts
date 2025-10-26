import axiosInstance from '../axiosInstance'
import type { Book } from '@/types/book'

export const booksApi = {
  // 获取所有书籍
  getList() {
    return axiosInstance.get('/book/list')
  },

  // 根据ID获取书籍
  getBookById(bookId: number) {
    return axiosInstance.get(`/book/${bookId}`)
  },

  // 添加书籍
  add(data: Partial<Book>) {
    return axiosInstance.post('/book/addBook', data)
  },

  // 更新书籍
  update(data: Partial<Book>) {
    return axiosInstance.put('/book/update', data)
  },

  // 删除书籍
  deleteBook(bookId: number) {
    return axiosInstance.delete(`/book/delete/${bookId}`)
  },

  // 根据类型获取书籍
  getBooksByType(bookType: string) {
    return axiosInstance.get(`/book/type/${bookType}`)
  },

  // 根据标题精确搜索
  getBooksByTitle(title: string) {
    return axiosInstance.get('/book/search', { params: { title } })
  },

  // 根据标题模糊搜索
  getBooksByTitleContaining(title: string) {
    return axiosInstance.get('/book/search/title', { params: { title } })
  },

  // 获取未审核的书籍
  getUnreviewed() {
    return axiosInstance.get('/book/unreviewed')
  },

  // 获取被禁止的书籍
  getBanned() {
    return axiosInstance.get('/book/banned')
  },

  // 设置书籍为已审核且被禁止
  setReviewedAndBanned(bookId: number) {
    return axiosInstance.put(`/book/setReviewedAndBanned/${bookId}`)
  },

  // 设置书籍为已审核通过
  setReviewed(bookId: number) {
    return axiosInstance.put(`/book/setReviewed/${bookId}`)
  },

  // 解除书籍禁止状态
  unbanBook(bookId: number) {
    return axiosInstance.put(`/book/unban/${bookId}`)
  }
}
