export interface MemberDto {
    id: string
    firstName: string
    lastName: string
    email: string
    role: 'family' | 'couple' | 'solo' | 'group' | 'admin'
    authority: string[]
    emailVerified?: boolean
    avatar?: string
    phone?: string
    createdAt?: string
}

export type ProfileValues = {
    firstName: string
    lastName: string
    email: string
    phone: string
    avatar: string
    avatarFile?: File | null
}
