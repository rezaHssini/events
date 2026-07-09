import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Globe, MapPin } from 'lucide-react'
import { WebClubHeader } from '../../components/club/WebClubHeader'
import { Badge } from '../../components/UI'
import { AppImage } from '../../components/ui/AppImage'
import { usePlanner, useClubProfile } from '../../context/PlannerContext'
import { categories } from '../../data/mockData'
import { ImagePickerSheet } from '../../components/ui/StoryComposer'
import { useToast } from '../../context/ToastContext'

export default function ClubPageEditor() {
  const { clubProfile, updateClubProfile } = usePlanner()
  const profile = useClubProfile()
  const { toast } = useToast()
  const [name, setName] = useState(clubProfile?.name ?? profile.name)
  const [bio, setBio] = useState(clubProfile?.bio ?? profile.bio)
  const [banner, setBanner] = useState(clubProfile?.banner ?? profile.banner)
  const [avatar, setAvatar] = useState(clubProfile?.avatar ?? profile.avatar)
  const [picker, setPicker] = useState<'banner' | 'avatar' | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    clubProfile?.categories ?? profile.categories,
  )
  const [cityInput, setCityInput] = useState(
    (clubProfile?.cities ?? profile.cities).join(', '),
  )

  const handleSave = () => {
    updateClubProfile({
      name,
      bio,
      banner,
      avatar,
      categories: selectedCategories,
      cities: cityInput.split(',').map((c) => c.trim()).filter(Boolean),
    })
    toast('✓ Planner page updated')
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const handle = clubProfile?.handle ?? profile.handle

  return (
    <div className="pb-10">
      <WebClubHeader title="Manage planner page" subtitle="Public brand page — not your personal profile" />

      <div className="web-container max-w-5xl">
        <div className="mb-5 rounded-xl border border-secondary/30 bg-secondary/5 p-4 text-left text-sm">
          <p className="font-medium text-secondary">Planner page vs personal profile</p>
          <p className="mt-1 text-xs text-slate-400">
            Your planner page (@{handle}) showcases your brand, events & reviews. Your personal
            profile (@reza) is for friends, memories & social.
          </p>
          <Link to="/profile" className="mt-2 inline-block text-xs text-primary-light">
            View personal profile →
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="relative aspect-[21/9]">
              <AppImage src={banner} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => setPicker('banner')} className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 text-[10px]">
                Change banner
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
              <span className="absolute left-3 top-3">
                <Badge variant="primary">Planner Page</Badge>
              </span>
            </div>
            <div className="px-4 pb-4 pt-3 text-left">
              <button type="button" onClick={() => setPicker('avatar')}>
                <AppImage src={avatar} alt="" className="-mt-10 h-16 w-16 rounded-2xl border-4 border-[#14141f] object-cover" />
              </button>
              <p className="mt-2 font-bold">{name}</p>
              <p className="text-xs text-slate-400">@{handle}</p>
              <p className="mt-2 text-sm text-slate-300 line-clamp-3">{bio}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedCategories.map((c) => (
                  <span key={c} className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary-light">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-left">
          <Field label="Brand / club name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </Field>

          <Field label="Bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl bg-white/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </Field>

          <Field label="Event categories you host">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    selectedCategories.includes(cat) ? 'bg-primary' : 'bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Cities & areas" icon={MapPin}>
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Los Angeles, Arts District, Downtown"
              className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </Field>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl gradient-hero py-3 font-semibold"
          >
            Save changes
          </motion.button>
          <Link
            to={`/page/${handle}`}
            className="flex items-center gap-2 rounded-xl glass px-4 py-3 text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Link>
        </div>
      </div>

      <ImagePickerSheet
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={picker === 'banner' ? 'Banner image' : 'Avatar image'}
        onSelect={(src) => {
          if (picker === 'banner') setBanner(src)
          if (picker === 'avatar') setAvatar(src)
          setPicker(null)
        }}
      />
    </div>
  )
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon?: typeof Globe
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}
