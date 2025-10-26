export interface Book {
  book_id: number
  book_title: string
  book_writer: string
  book_type: string
  book_price: number
  book_seller_id: string
  book_descripe: string
  is_review: number
  is_banned: number
  // 举报相关字段
  is_reported?: boolean
  report_id?: number
  report_reason?: string
  reporter_id?: number
} 