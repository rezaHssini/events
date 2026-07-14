import { media } from '../data/media'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MobileHeader } from '../components/UI'

const subRatings = ['Vibe', 'Venue', 'Value', 'Food & Drinks']

export default function MemoryPage() {
  const [rating, setRating] = useState(0)
  const [subScores, setSubScores] = useState<Record<string, number>>({})
  const [posted, setPosted] = useState(false)

  if (posted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-6xl"
        >
          ✨
        </motion.div>
        <h2 className="mt-4 text-2xl font-bold">Memory posted!</h2>
        <p className="mt-2 text-slate-400">
          Your review helps others discover Neon Collective events
        </p>
        <div className="mt-6 rounded-xl glass p-4 text-left">
          <p className="text-xs text-success font-medium">✓ Verified attendee</p>
          <p className="mt-2 text-warning">{'★'.repeat(rating)}</p>
          <p className="mt-1 text-sm">"Amazing night! Pre-ordering drinks was a game changer."</p>
        </div>
        <Link to="/feed" className="mt-8 rounded-xl bg-primary px-8 py-3 font-bold">
          Back to Feed
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <MobileHeader title="Share Your Night" back="/wallet" />

      <div className="p-4 text-left">
        <p className="text-sm text-slate-400">Brunch & Beats Workshop · Jul 5</p>
        <p className="mt-1 text-xs text-success">✓ Verified attendee — you checked in</p>

        <h3 className="mt-6 font-semibold">Overall rating</h3>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 1.2 }}
              onClick={() => setRating(s)}
              className={`text-3xl ${s <= rating ? 'text-warning' : 'text-slate-600'}`}
            >
              ★
            </motion.button>
          ))}
        </div>

        <h3 className="mt-6 font-semibold">Rate details</h3>
        {subRatings.map((label) => (
          <div key={label} className="mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span>{subScores[label] || 0}/5</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              value={subScores[label] || 0}
              onChange={(e) =>
                setSubScores((s) => ({ ...s, [label]: Number(e.target.value) }))
              }
              className="mt-1 w-full accent-primary"
            />
          </div>
        ))}

        <h3 className="mt-6 font-semibold">Your review</h3>
        <textarea
          placeholder="How was the event?"
          className="mt-2 w-full rounded-xl bg-white/10 p-4 text-sm outline-none resize-none h-24"
          defaultValue="Amazing night! Pre-ordering drinks was a game changer."
        />

        <h3 className="mt-6 font-semibold">Photos & videos</h3>
        <div className="mt-2 flex gap-2">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white/10 text-2xl">
            📷
          </div>
          <img
            src={media.memory1}
            alt=""
            className="h-24 w-24 rounded-xl object-cover"
          />
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-slate-500 text-sm">
            + Add
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-lg border-t border-white/10 bg-surface p-4">
        <button
          onClick={() => setPosted(true)}
          disabled={rating === 0}
          className="w-full rounded-xl gradient-hero py-3.5 font-bold text-white disabled:opacity-40"
        >
          Post Memory
        </button>
      </div>
    </div>
  )
}
