export type PostKind = 'update' | 'memory' | 'event'

export interface PostAuthor {
  id: string
  name: string
  handle: string
  avatar: string
  isPlannerPage?: boolean
}

export interface UserPost {
  id: string
  kind: PostKind
  text: string
  media: string[]
  createdAt: string
  author: PostAuthor
  rating?: number
  eventTitle?: string
  linkedEventId?: string
}
