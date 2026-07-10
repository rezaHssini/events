import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { userStories as initialStories, type UserStory, type StorySlide } from '../data/storiesData'
import { currentUser } from '../data/socialData'
import { media } from '../data/media'

type StoriesContextValue = {
  stories: UserStory[]
  addStory: (caption: string, imageSrc?: string) => void
  getMyStory: () => UserStory | undefined
}

const StoriesContext = createContext<StoriesContextValue | null>(null)

export function StoriesProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<UserStory[]>(initialStories)

  const addStory = useCallback((caption: string, imageSrc: string = media.concert) => {
    const slide: StorySlide = {
      id: `me-${Date.now()}`,
      type: 'image',
      src: imageSrc,
      caption,
    }
    setStories((prev) => {
      const existing = prev.find((s) => s.userId === 'me')
      if (existing) {
        return prev.map((s) =>
          s.userId === 'me' ? { ...s, slides: [...s.slides, slide] } : s,
        )
      }
      return [
        {
          userId: 'me',
          handle: currentUser.handle,
          name: 'You',
          avatar: currentUser.avatar,
          slides: [slide],
        },
        ...prev,
      ]
    })
  }, [])

  const getMyStory = useCallback(() => stories.find((s) => s.userId === 'me'), [stories])

  return (
    <StoriesContext.Provider value={{ stories, addStory, getMyStory }}>
      {children}
    </StoriesContext.Provider>
  )
}

export function useStories() {
  const ctx = useContext(StoriesContext)
  if (!ctx) throw new Error('useStories must be used within StoriesProvider')
  return ctx
}
