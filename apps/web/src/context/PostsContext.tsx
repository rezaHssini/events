import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { currentUser } from '../data/socialData'
import { events } from '../data/mockData'
import { media } from '../data/media'
import type { PostAuthor, PostKind, UserPost } from '../types/posts'

const STORAGE_KEY = 'event-user-posts'

type CreatePostInput = {
  text: string
  media?: string[]
  linkedEventId?: string
  isMemory?: boolean
  rating?: number
  eventTitle?: string
  asPlannerPage?: boolean
}

type PostsContextValue = {
  posts: UserPost[]
  addPost: (input: CreatePostInput) => UserPost
  getPostsByAuthor: (authorId: string) => UserPost[]
}

const PostsContext = createContext<PostsContextValue | null>(null)

function readPosts(): UserPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as UserPost[]
  } catch {
    return []
  }
}

function persistPosts(posts: UserPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

function buildAuthor(asPlannerPage?: boolean): PostAuthor {
  if (asPlannerPage) {
    return {
      id: '4',
      name: 'Neon Collective',
      handle: 'neoncollective',
      avatar: media.avatarNeon,
      isPlannerPage: true,
    }
  }
  return {
    id: currentUser.id,
    name: currentUser.name,
    handle: currentUser.handle,
    avatar: currentUser.avatar,
  }
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<UserPost[]>(() => readPosts())

  const addPost = useCallback((input: CreatePostInput) => {
    const linkedEvent = input.linkedEventId
      ? events.find((e) => e.id === input.linkedEventId)
      : undefined
    const kind: PostKind = input.isMemory ? 'memory' : 'update'

    const post: UserPost = {
      id: `post-${Date.now()}`,
      kind,
      text: input.text.trim(),
      media: input.media ?? [],
      createdAt: new Date().toISOString(),
      author: buildAuthor(input.asPlannerPage),
      rating: input.isMemory ? input.rating : undefined,
      eventTitle: linkedEvent?.title ?? input.eventTitle,
      linkedEventId: input.linkedEventId,
    }

    setPosts((prev) => {
      const next = [post, ...prev]
      persistPosts(next)
      return next
    })

    return post
  }, [])

  const getPostsByAuthor = useCallback(
    (authorId: string) => posts.filter((p) => p.author.id === authorId),
    [posts],
  )

  return (
    <PostsContext.Provider value={{ posts, addPost, getPostsByAuthor }}>
      {children}
    </PostsContext.Provider>
  )
}

export function usePosts() {
  const ctx = useContext(PostsContext)
  if (!ctx) throw new Error('usePosts must be used within PostsProvider')
  return ctx
}
