import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserSettings } from '../context/UserSettingsContext'
import { useToast } from '../context/ToastContext'
import { ImagePickerSheet } from '../components/ui/StoryComposer'
import { media } from '../data/media'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { prefs, updatePrefs } = useUserSettings()
  const { toast } = useToast()
  const [name, setName] = useState(prefs.name)
  const [bio, setBio] = useState(prefs.bio)
  const [avatar, setAvatar] = useState<string>(media.avatarReza)
  const [pickerOpen, setPickerOpen] = useState(false)

  const save = () => {
    updatePrefs({ name, bio })
    toast('✓ Profile updated')
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <header className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="rounded-full glass px-3 py-1.5 text-sm">Back</button>
        <h1 className="text-lg font-bold">Edit profile</h1>
      </header>
      <div className="space-y-4 text-left">
        <button type="button" onClick={() => setPickerOpen(true)} className="mx-auto block">
          <img src={avatar} alt="" className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/30" />
          <p className="mt-2 text-center text-sm text-[#0a84ff]">Change photo</p>
        </button>
        <label className="block text-sm font-medium">Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-[16px] bg-white/10 px-4 py-3.5" />
        </label>
        <label className="block text-sm font-medium">Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 w-full rounded-[16px] bg-white/10 px-4 py-3.5" />
        </label>
        <button type="button" onClick={save} className="ios-button w-full py-3.5">Save changes</button>
      </div>
      <ImagePickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Profile photo" onSelect={setAvatar} />
    </div>
  )
}
