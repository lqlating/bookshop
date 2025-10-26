// @ts-nocheck
export interface Comment {
    comment_id: number
    content: string
    user_id: number
    article_id?: number
    parent_id?: number
    like_count?: number
    star_count?: number
    is_banned: number // 注意这里是number类型，与后端匹配
    is_reported?: number // 0表示未举报，1表示已被举报
    publish_time: string
    // 前端额外需要的字段
    user_name?: string
    target_id?: number
    target_type?: string
    report_id?: number // 举报ID
    report_reason?: string // 举报原因
} 