export interface Article {
    article_id: number
    title: string
    content: string
    author_id: number
    author_name: string
    publication_time: string
    is_banned: boolean
    img?: string  // 图片 URL 路径，不再是 base64
    address?: string
    like_count?: number
    star_count?: number
    is_reported?: boolean
    report_id?: number
    report_reason?: string
    // 兼容旧字段
    img_url?: string  // 已废弃，使用 img
}