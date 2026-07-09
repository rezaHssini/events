import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { UserStory } from '../../data/storiesData'

const SLIDE_DURATION = 5000

export function StoryViewer({
  stories,
  startIndex,
  onClose,
}: {
  stories: UserStory[]
  startIndex: number
  onClose: () => void
}) {
  const [userIndex, setUserIndex] = useState(startIndex)
  const [slideIndex, setSlideIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const story = stories[userIndex]
  const slide = story?.slides[slideIndex]

  const goNext = useCallback(() => {
    if (!story) return
    if (slideIndex < story.slides.length - 1) {
      setSlideIndex((i) => i + 1)
      setProgress(0)
    } else if (userIndex < stories.length - 1) {
      setUserIndex((i) => i + 1)
      setSlideIndex(0)
      setProgress(0)
    } else {
      onClose()
    }
  }, [story, slideIndex, userIndex, stories.length, onClose])

  const goPrev = useCallback(() => {
    if (slideIndex > 0) {
      setSlideIndex((i) => i - 1)
      setProgress(0)
    } else if (userIndex > 0) {
      const prev = stories[userIndex - 1]
      setUserIndex((i) => i - 1)
      setSlideIndex(prev.slides.length - 1)
      setProgress(0)
    }
  }, [slideIndex, userIndex, stories])

  useEffect(() => {
    if (!slide || slide.type === 'video') return
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          goNext()
          return 0
        }
        return p + 100 / (SLIDE_DURATION / 50)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [slide, slideIndex, userIndex, goNext])

  if (!story || !slide) return null

  const profileLink = story.userId === '4' ? `/page/${story.handle}` : `/user/${story.handle}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      <div className="relative mx-auto h-full w-full max-w-md">
        {/* Progress bars */}
        <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 px-3 pt-3">
          {story.slides.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: i < slideIndex ? '100%' : i === slideIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute left-0 right-0 top-6 z-20 flex items-center justify-between px-4">
          <Link to={profileLink} className="flex items-center gap-2">
            <img src={story.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/50" />
            <span className="text-sm font-semibold drop-shadow">{story.name}</span>
            <span className="text-xs text-white/60">2h</span>
          </Link>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-white/80 hover:bg-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Media */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${userIndex}-${slideIndex}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {slide.type === 'video' ? (
              <video
                src={slide.src}
                poster={slide.poster}
                autoPlay
                muted
                playsInline
                onEnded={goNext}
                className="h-full w-full object-cover"
              />
            ) : (
              <img src={slide.src} alt="" className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        {slide.caption && (
          <p className="absolute bottom-24 left-4 right-4 z-20 text-center text-sm font-medium drop-shadow-lg">
            {slide.caption}
          </p>
        )}

        {/* Tap zones */}
        <button type="button" className="absolute inset-y-0 left-0 z-10 w-1/3" onClick={goPrev} aria-label="Previous" />
        <button type="button" className="absolute inset-y-0 right-0 z-10 w-1/3" onClick={goNext} aria-label="Next" />

        {/* Nav arrows (visible on desktop) */}
        {userIndex > 0 && (
          <button
            type="button"
            onClick={() => {
              setUserIndex((i) => i - 1)
              setSlideIndex(0)
              setProgress(0)
            }}
            className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {userIndex < stories.length - 1 && (
          <button
            type="button"
            onClick={() => {
              setUserIndex((i) => i + 1)
              setSlideIndex(0)
              setProgress(0)
            }}
            className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
