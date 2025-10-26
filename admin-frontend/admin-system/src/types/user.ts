export interface User {
    id: number
    username: string
    account: string
    email: string
    avatar_url?: string
    gender: string
    introduction: string
    is_banned: boolean
    fans_count: number
    subscriptions: number[]
    created_at?: string
    updated_at?: string
}

export interface UserLoginForm {
    account: string
    password: string
}

export interface UserRegisterForm {
    username: string
    account: string
    password: string
    email: string
    avatar?: File
    gender?: string
    introduction?: string
}

export interface UserUpdateForm {
    id: number
    username?: string
    email?: string
    avatar?: File
    gender?: string
    introduction?: string
}

export interface UserState {
    currentUser: User | null
    token: string | null
    isLoggedIn: boolean
} 