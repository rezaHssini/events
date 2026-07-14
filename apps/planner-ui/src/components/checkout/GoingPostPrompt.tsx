import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Event } from '../../data/mockData'
import { currentUser } from '../../data/socialData'
import { useTickets } from '../../context/TicketsContext'

type GoingPostPromptProps = {
  event: Event
  ticketCount: number
  onSkip: () => void
}

export function GoingPostPrompt({ event, ticketCount, onSkip }: GoingPostPromptProps) {
  const { postGoing } = useTickets()
  const [caption, setCaption] = useState(`I'm going to ${event.title}! Who else is in?`)
  const [posted, setPosted] = useState(false)

  const handlePost = () => {
    postGoing(event, caption.trim())
    setPosted(true)
  }

  if (posted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 w-full max-w-sm rounded-[24px] liquid-glass p-5 text-left"
      >
        <p className="text-center text-3xl">🎉</p>
        <h3 className="mt-3 text-center text-lg font-bold">Shared with friends!</h3>
        <p className="mt-2 text-center ios-caption">
          Your friends will see you&apos;re going on their feed.
        </p>
        <div className="mt-4 flex gap-3 overflow-hidden rounded-[18px] bg-white/8 p-3">
          <img src={event.cover} alt="" className="h-16 w-16 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">{event.title}</p>
            <p className="ios-caption">{event.date} · {event.location}</p>
            <p className="mt-1 text-sm italic text-[rgba(235,235,245,0.7)]">&ldquo;{caption}&rdquo;</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Link to="/feed" className="ios-button flex-1 py-3 text-center text-[15px]">
            View feed
          </Link>
          <Link to="/my-events" className="flex-1 rounded-[14px] liquid-glass-subtle py-3 text-center text-[15px] font-semibold">
            My tickets
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 w-full max-w-sm rounded-[24px] liquid-glass p-5 text-left"
    >
      <div className="flex items-center gap-3">
        <img src={currentUser.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
        <div>
          <p className="font-semibold">Let friends know you&apos;re going</p>
          <p className="ios-caption">
            {ticketCount > 1
              ? `You bought ${ticketCount} tickets — share the vibe`
              : 'Post to your feed so friends can join'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-3 overflow-hidden rounded-[18px] bg-white/8 p-3">
        <img src={event.cover} alt="" className="h-16 w-16 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{event.title}</p>
          <p className="ios-caption">{event.date} · {event.location}</p>
        </div>
      </div>

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={3}
        className="mt-4 w-full resize-none rounded-[16px] border-0 bg-white/10 px-4 py-3 text-[15px] outline-none placeholder:text-white/35"
      />

      <button type="button" onClick={handlePost} className="ios-button mt-4 w-full py-3.5 text-[17px]">
        Post I&apos;m going
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="mt-2 w-full py-2 text-[15px] text-[rgba(235,235,245,0.45)]"
      >
        Maybe later
      </button>
    </motion.div>
  )
}
