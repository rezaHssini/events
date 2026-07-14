import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, ChevronRight, ChevronLeft, Globe, MapPin } from 'lucide-react'
import { usePlanner } from '../context/PlannerContext'
import { useUserSettings } from '../context/UserSettingsContext'
import { useToast } from '../context/ToastContext'
import { ImagePickerSheet } from '../components/ui/StoryComposer'
import { FormChip, FormField, FormInput, FormTextarea } from '../components/ui/FormPrimitives'
import { AsyncButton } from '../components/ui/AsyncButton'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { media } from '../data/media'
import { categories } from '../data/mockData'

const STEPS = ['Brand', 'Visuals', 'Details'] as const

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { becomePlanner } = usePlanner()
  const { updatePrefs } = useUserSettings()
  const { toast } = useToast()
  const { loading: finishing, run: runFinish } = useAsyncAction()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [cities, setCities] = useState('Los Angeles')
  const [banner, setBanner] = useState<string>(media.bannerConcert)
  const [avatar, setAvatar] = useState<string>(media.avatarNeon)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Music', 'Nightlife'])
  const [picker, setPicker] = useState<'banner' | 'avatar' | null>(null)

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const finish = () => {
    if (!name.trim()) return
    void runFinish(async () => {
      becomePlanner({
        name: name.trim(),
        bio: bio.trim() || 'Hosting unforgettable events.',
        banner,
        avatar,
        website: website.trim(),
        categories: selectedCategories.length > 0 ? selectedCategories : ['Music'],
        cities: cities
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      })
      updatePrefs({ onboardingCompleted: true })
      toast('✓ Planner page ready')
      navigate('/', { replace: true })
    }, 450)
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col ios-mesh-bg">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-[max(env(safe-area-inset-top,0px),16px)] pb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] gradient-hero shadow-lg shadow-primary/30">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 ios-large-title !text-[28px]">Set up your page</h1>
          <p className="mt-1 ios-caption">
            Create your public planner brand — name, cover, and details
          </p>
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
                <motion.div
                  layoutId="planner-onboarding-step"
                  className="absolute inset-0 rounded-xl bg-white/14"
                />
              )}
              <span className="relative">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-4 text-left"
            >
              {step === 0 && (
                <>
                  <FormField label="Planner / brand name *">
                    <FormInput
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Neon Collective"
                      autoFocus
                    />
                  </FormField>
                  <FormField label="Description" hint="Shown on your public planner page">
                    <FormTextarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Music in warehouses, jazz on rooftops, workshops in cafés..."
                    />
                  </FormField>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="overflow-hidden rounded-[22px] liquid-glass">
                    <div className="relative h-36">
                      <img src={banner} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPicker('banner')}
                        className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium backdrop-blur"
                      >
                        Change cover
                      </button>
                    </div>
                    <div className="relative px-4 pb-4">
                      <button
                        type="button"
                        onClick={() => setPicker('avatar')}
                        className="absolute -top-8 left-4"
                        aria-label="Change profile image"
                      >
                        <img
                          src={avatar}
                          alt=""
                          className="h-16 w-16 rounded-2xl border-4 border-[#0a0a0f] object-cover"
                        />
                      </button>
                      <div className="pt-10">
                        <p className="font-bold">{name || 'Your planner name'}</p>
                        <p className="mt-0.5 line-clamp-2 ios-caption">
                          {bio || 'Your description will appear here'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center ios-caption">
                    Tap cover or profile image · camera, gallery, or upload
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <FormField label="Categories you host">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <FormChip
                          key={cat}
                          label={cat}
                          selected={selectedCategories.includes(cat)}
                          onClick={() => toggleCategory(cat)}
                        />
                      ))}
                    </div>
                  </FormField>
                  <FormField label="Cities & areas" hint="Comma separated">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#0a84ff]" />
                      <FormInput
                        value={cities}
                        onChange={(e) => setCities(e.target.value)}
                        placeholder="Los Angeles, Downtown"
                      />
                    </div>
                  </FormField>
                  <FormField label="Website (optional)">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0 text-[#0a84ff]" />
                      <FormInput
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourclub.com"
                      />
                    </div>
                  </FormField>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-4 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 rounded-[16px] liquid-glass-subtle px-4 py-3.5 text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={step === 0 && !name.trim()}
              onClick={() => setStep(step + 1)}
              className="ios-button flex flex-1 items-center justify-center gap-1 py-3.5 disabled:opacity-40"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <AsyncButton
              loading={finishing}
              disabled={!name.trim()}
              onClick={finish}
              className="ios-button flex-1 py-3.5 text-[17px] disabled:opacity-40"
            >
              Finish setup
            </AsyncButton>
          )}
        </div>
      </div>

      <ImagePickerSheet
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={picker === 'banner' ? 'Cover image' : 'Profile image'}
        onSelect={(src) => {
          if (picker === 'banner') setBanner(src)
          if (picker === 'avatar') setAvatar(src)
          setPicker(null)
        }}
      />
    </div>
  )
}
