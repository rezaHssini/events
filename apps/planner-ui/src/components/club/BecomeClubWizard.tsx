import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, ChevronRight, ChevronLeft, Globe, MapPin } from 'lucide-react'
import { usePlanner } from '../../context/PlannerContext'
import { useToast } from '../../context/ToastContext'
import { ImagePickerSheet } from '../ui/StoryComposer'
import { FormChip, FormField, FormInput, FormTextarea } from '../ui/FormPrimitives'
import { media } from '../../data/media'
import { categories } from '../../data/mockData'

const STEPS = ['Brand', 'Visuals', 'Details'] as const

export function BecomeClubWizard() {
  const { becomePlanner } = usePlanner()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [cities, setCities] = useState('Los Angeles, Arts District')
  const [banner, setBanner] = useState<string>(media.bannerConcert)
  const [avatar, setAvatar] = useState<string>(media.avatarNeon)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Music', 'Nightlife'])
  const [picker, setPicker] = useState<'banner' | 'avatar' | null>(null)

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const launch = () => {
    if (!name.trim()) return
    becomePlanner({
      name: name.trim(),
      bio: bio.trim() || 'Hosting unforgettable events.',
      banner,
      avatar,
      website: website.trim(),
      categories: selectedCategories.length > 0 ? selectedCategories : ['Music'],
      cities: cities.split(',').map((c) => c.trim()).filter(Boolean),
    })
    toast('🎉 Your club is live!')
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] gradient-hero shadow-2xl shadow-primary/40"
        >
          <Crown className="h-10 w-10 text-white" />
        </motion.div>
        <h1 className="mt-6 ios-large-title !text-[28px] gradient-text">Launch your club</h1>
        <p className="mx-auto mt-2 max-w-xs ios-caption">
          Set up your planner page — separate from your personal profile
        </p>
      </motion.div>

      <div className="mt-6 flex gap-1 liquid-glass-subtle rounded-[14px] p-1">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`relative flex-1 rounded-xl py-2.5 text-sm font-medium ${
              step === i ? 'text-white' : 'text-[rgba(235,235,245,0.45)]'
            }`}
          >
            {step === i && <motion.div layoutId="club-step" className="absolute inset-0 rounded-xl bg-white/14" />}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          className="mt-6 space-y-4"
        >
          {step === 0 && (
            <>
              <FormField label="Club / brand name *">
                <FormInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Neon Collective" />
              </FormField>
              <FormField label="Bio" hint="Shown on your public planner page">
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
                <div className="relative h-32">
                  <img src={banner} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPicker('banner')}
                    className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs"
                  >
                    Change cover
                  </button>
                </div>
                <div className="relative px-4 pb-4">
                  <button type="button" onClick={() => setPicker('avatar')} className="absolute -top-8 left-4">
                    <img src={avatar} alt="" className="h-16 w-16 rounded-2xl border-4 border-[#0a0a0f] object-cover" />
                  </button>
                  <div className="pt-10 text-left">
                    <p className="font-bold">{name || 'Your club name'}</p>
                    <p className="ios-caption">Preview of your planner page</p>
                  </div>
                </div>
              </div>
              <p className="text-center ios-caption">Tap cover or avatar to upload</p>
            </>
          )}

          {step === 2 && (
            <>
              <FormField label="Event categories you host">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <FormChip key={cat} label={cat} selected={selectedCategories.includes(cat)} onClick={() => toggleCategory(cat)} />
                  ))}
                </div>
              </FormField>
              <FormField label="Cities & areas" hint="Comma separated">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[#0a84ff]" />
                  <FormInput value={cities} onChange={(e) => setCities(e.target.value)} placeholder="Los Angeles, Downtown" />
                </div>
              </FormField>
              <FormField label="Website (optional)">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 text-[#0a84ff]" />
                  <FormInput value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourclub.com" />
                </div>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🎪', label: 'Multi-category' },
                  { icon: '📍', label: 'Any venue' },
                  { icon: '🍹', label: 'Per-event menu' },
                  { icon: '👥', label: 'Staff tools' },
                ].map((f) => (
                  <div key={f.label} className="rounded-[18px] liquid-glass-subtle p-3 text-center">
                    <span className="text-2xl">{f.icon}</span>
                    <p className="mt-1 text-xs text-white/50">{f.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1 rounded-[16px] liquid-glass-subtle px-4 py-3 text-sm">
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
          <button
            type="button"
            disabled={!name.trim()}
            onClick={launch}
            className="ios-button flex-1 py-3.5 text-[17px] disabled:opacity-40"
          >
            Launch My Club
          </button>
        )}
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
