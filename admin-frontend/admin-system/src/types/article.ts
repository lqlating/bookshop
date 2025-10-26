export interface Article {
    article_id: number
    title: string
    content: string
    author_id: number
    author_name: string
    publication_time: string
    is_banned: boolean
    img_url?: string
    address?: string
    like_count?: number
    star_count?: number
    is_reported?: boolean
    report_id?: number
    report_reason?: string
}