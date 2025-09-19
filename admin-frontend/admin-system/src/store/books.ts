import { defineStore } from 'pinia'
import { ref } from 'vue'
import { booksApi } from '@/api/modules/booksApi'
import type { Book } from '@/types/book'

export const useBooksStore = defineStore('books', () => {
  const bookList = ref<Book[]>([])
  const normalBooks = ref<Book[]>([])
  const bannedBooks = ref<Book[]>([])
  const loading = ref(false)

  const getBooks = async (params: { status?: 'pending' | 'banned' | 'normal' }) => {
    loading.value = true
    try {
      let res
      if (params.status === 'pending') {
        res = await booksApi.getUnreviewed()
        bookList.value = res.data.data
      } else if (params.status === 'banned') {
        res = await booksApi.getBanned()
        bannedBooks.value = res.data.data
      } else {
        res = await booksApi.getList()
        normalBooks.value = res.data.data
      }
    } finally {
      loading.value = false
    }
  }

  const addBook = async (data: Partial<Book>) => {
    await booksApi.add(data)
    await getBooks({})
  }

  const updateBook = async (book: Partial<Book>) => {
    await booksApi.update(book)
    await getBooks({})
  }

  const deleteBook = async (id: number) => {
    await booksApi.deleteBook(id)
    await getBooks({})
  }

  // 设置书籍为已审核通过
  const setBookReviewed = async (id: number) => {
    await booksApi.setReviewed(id)
    await getBooks({ status: 'pending' })
  }

  // 设置书籍为已审核且被禁止
  const setBookReviewedAndBanned = async (id: number) => {
    await booksApi.setReviewedAndBanned(id)
    await getBooks({ status: 'pending' })
  }

  // 解除书籍禁止状态
  const unbanBook = async (id: number) => {
    await booksApi.unbanBook(id)
    await getBooks({ status: 'banned' })
  }

  return {
    bookList,
    normalBooks,
    bannedBooks,
    loading,
    getBooks,
    addBook,
    updateBook,
    deleteBook,
    setBookReviewed,
    setBookReviewedAndBanned,
    unbanBook
  }
})
