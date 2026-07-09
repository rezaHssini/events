import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Users, Sparkles } from 'lucide-react'
import { suggestedUsers } from '../data/socialData'
import { creatorProfilesByHandle } from '../data/creatorProfiles'
import { FormChip } from '../components/ui/FormPrimitives'
import { FollowButton } from '../components/Social'
import { useUserSettings } from '../context/UserSettingsContext'
import { AsyncButton } from '../components/ui/AsyncButton'
import { useAsyncAction } from '../hooks/useAsyncAction'

const STEPS = ['Interests', 'Follow'] as const

const ONBOARDING_CATEGORIES = [
  'Music',
  'Art',
  'Food & Drink',
  'Nightlife',
  'Workshop',
  'Sports',
  'Community',
  'Comedy',
  'Film & TV',
  'Wellness',
  'Tech',
  'Outdoor',
  'Fashion',
  'Family',
  'LGBTQ+',
  'Theater',
  'Dance',
  'Networking',
] as const

const CATEGORY_EMOJI: Record<string, string> = {
  Music: '🎵',
  Art: '🎨',
  'Food & Drink': '🍸',
  Workshop: '🛠️',
  Sports: '⚽',
  Nightlife: '🌙',
  Community: '🤝',
  Comedy: '😂',
  'Film & TV': '🎬',
  Wellness: '🧘',
  Tech: '💻',
  Outdoor: '🏕️',
  Fashion: '👗',
  Family: '👨‍👩‍👧',
  'LGBTQ+': '🏳️‍🌈',
  Theater: '🎭',
  Dance: '💃',
  Networking: '🤝',
}

const ONBOARDING_PEOPLE = suggestedUsers
  .filter((u) => !u.isCreator)
  .sort((a, b) => b.mutualFriends - a.mutualFriends)
  .slice(0, 6)

const ONBOARDING_PLANNERS = Object.values(creatorProfilesByHandle)

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { updatePrefs } = useUserSettings()
  const [step, setStep] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const { loading: finishing, run: runFinish } = useAsyncAction()

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const finish = () => {
    void runFinish(async () => {
      updatePrefs({
        onboardingCompleted: true,
        preferredCategories: selectedCategories,
      })
      navigate('/feed', { replace: true })
    }, 500)
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0f]">
      <div className="min-h-0 flex-1 overflow-y-auto py-8 sm:py-12">
        <div className="web-container mx-auto max-w-2xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] gradient-hero shadow-lg shadow-primary/30">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-4 ios-large-title !text-[28px]">Welcome aboard</h1>
            <p className="mt-1 ios-caption">Let&apos;s personalize your event feed</p>
          </motion.div>

        <div className="mt-6 flex gap-1 liquid-glass-subtle rounded-[14px] p-1">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`relative flex-1 rounded-xl py-2.5 text-center text-sm font-medium ${
                step === i ? 'text-white' : 'text-[rgba(235,235,245,0.45)]'
              }`}
            >
              {step === i && (
                <motion.div layoutId="onboarding-step" className="absolute inset-0 rounded-xl bg-white/14" />
              )}
              <span className="relative">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="interests"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                <div className="text-left">
                  <h2 className="ios-headline">What are you into?</h2>
                  <p className="mt-1 ios-caption">
                    Pick categories to see more of what you love. You can change these anytime.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ONBOARDING_CATEGORIES.map((cat) => (
                    <FormChip
                      key={cat}
                      label={`${CATEGORY_EMOJI[cat] ?? '✨'} ${cat}`}
                      selected={selectedCategories.includes(cat)}
                      onClick={() => toggleCategory(cat)}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="follow"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-6 pb-2"
              >
                <div className="text-left">
                  <h2 className="ios-headline">Follow people & planners</h2>
                  <p className="mt-1 ios-caption">
                    Optional — follow friends and event pages to fill your feed. Skip if you prefer.
                  </p>
                </div>

                <section>
                  <p className="mb-3 text-left text-xs font-bold uppercase tracking-widest text-primary-light">
                    Suggested people
                  </p>
                  <div className="space-y-1 rounded-[20px] liquid-glass-subtle p-2">
                    {ONBOARDING_PEOPLE.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 rounded-[14px] px-2 py-2">
                        <img
                          src={user.avatar}
                          alt=""
                          className="h-11 w-11 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate text-sm font-semibold">{user.name}</p>
                          <p className="truncate text-xs text-slate-400">@{user.handle}</p>
                          {user.mutualFriends > 0 && (
                            <p className="text-[11px] text-primary-light">
                              {user.mutualFriends} mutual friends
                            </p>
                          )}
                        </div>
                        <FollowButton userId={user.id} size="sm" />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="mb-3 text-left text-xs font-bold uppercase tracking-widest text-secondary">
                    Event planner pages
                  </p>
                  <div className="flex flex-col gap-4">
                    {ONBOARDING_PLANNERS.map((planner) => (
                      <div
                        key={planner.handle}
                        className="overflow-hidden rounded-[18px] liquid-glass-subtle"
                      >
                        <div className="relative h-24 w-full overflow-hidden">
                          <img
                            src={planner.banner}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#14141f] via-[#14141f]/40 to-transparent" />
                        </div>
                        <div className="flex items-center gap-3 p-3">
                          <img
                            src={planner.avatar}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-white/10"
                          />
                          <div className="min-w-0 flex-1 text-left">
                            <p className="flex items-center gap-1 truncate text-sm font-semibold">
                              {planner.name}
                              {planner.verified && (
                                <span className="text-xs text-secondary">✓</span>
                              )}
                            </p>
                            <p className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Users className="h-3 w-3 shrink-0" />
                              {planner.followers.toLocaleString()} followers
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                              {planner.bio}
                            </p>
                          </div>
                          <FollowButton userId={planner.followId} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 shrink-0 border-t border-white/10 bg-[#0a0a0f]/92 backdrop-blur-xl">
        <div className="web-container mx-auto max-w-2xl px-4 py-4 sm:px-6">
        {step === 0 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="ios-button flex w-full items-center justify-center gap-2 py-4 text-[17px]"
          >
            Continue
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <div className="space-y-2">
            <AsyncButton
              loading={finishing}
              loadingLabel="Setting up…"
              onClick={finish}
              className="w-full py-4 text-[17px]"
            >
              Finish
            </AsyncButton>
            <AsyncButton
              variant="link"
              loading={finishing}
              loadingLabel="Skipping…"
              onClick={finish}
              className="w-full py-2 text-[15px]"
            >
              Skip for now
            </AsyncButton>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
