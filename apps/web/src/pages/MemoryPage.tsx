import { media } from '../data/media'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppImage } from '../components/ui/AppImage'
import { WebPageHeader } from '../components/layout/WebLayout'

const subRatings = ['Vibe', 'Venue', 'Value', 'Food & Drinks']

export default function MemoryPage() {
  const [rating, setRating] = useState(0)
  const [subScores, setSubScores] = useState<Record<string, number>>({})
  const [posted, setPosted] = useState(false)

  if (posted) {
    return (
      <div className="pb-10">
        <WebPageHeader title="Memory posted" subtitle="Thanks for sharing your experience" />
        <div className="web-container flex max-w-lg flex-col items-center py-12 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-6xl"
          >
            ✨
          </motion.div>
          <p className="mt-4 text-slate-400">
            Your review helps others discover Neon Collective events
          </p>
          <div className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
            <p className="text-xs font-medium text-success">✓ Verified attendee</p>
            <p className="mt-2 text-warning">{'★'.repeat(rating)}</p>
            <p className="mt-1 text-sm">"Amazing night! Pre-ordering drinks was a game changer."</p>
          </div>
          <Link to="/feed" className="mt-8 rounded-xl bg-primary px-8 py-3 font-bold">
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-10">
      <WebPageHeader
        title="Share Your Night"
        subtitle="Brunch & Beats Workshop · Jul 5"
        actions={
          <Link
            to="/my-events"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            ← My events
          </Link>
        }
      />

      <div className="web-container max-w-2xl space-y-6 text-left">
        <p className="text-xs text-success">✓ Verified attendee — you checked in</p>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-semibold">Overall rating</h3>
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
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-semibold">Rate details</h3>
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
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-semibold">Your review</h3>
          <textarea
            placeholder="How was the event?"
            className="mt-2 h-28 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm outline-none focus:border-primary/40"
            defaultValue="Amazing night! Pre-ordering drinks was a game changer."
          />
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-semibold">Photos & videos</h3>
          <div className="mt-2 flex gap-2">
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white/10 text-2xl">
              📷
            </div>
            <AppImage src={media.memory1} alt="" className="h-24 w-24 rounded-xl object-cover" />
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-sm text-slate-500">
              + Add
            </div>
          </div>
        </section>

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
