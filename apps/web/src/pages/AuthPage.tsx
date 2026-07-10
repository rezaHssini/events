import { media } from '../data/media'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useUserSettings } from '../context/UserSettingsContext'
import { TypewriterText } from '../components/ui/TypewriterText'
import { OtpInput } from '../components/ui/OtpInput'
import { MobileAppPromo } from '../components/layout/MobileAppPromo'

type AuthStep = 'identifier' | 'code'

const backgroundMedia = [
  {
    type: 'image' as const,
    src: media.concert,
    tagline: 'Find your next night out.',
  },
  {
    type: 'image' as const,
    src: media.festival,
    tagline: 'Live moments worth sharing.',
  },
  {
    type: 'image' as const,
    src: media.warehouse,
    tagline: 'Where the beat finds you.',
  },
  {
    type: 'image' as const,
    src: media.jazz,
    tagline: 'Your scene starts here.',
  },
]

function detectMethod(value: string): 'email' | 'phone' | null {
  const v = value.trim()
  if (v.includes('@') && v.includes('.')) return 'email'
  if (v.replace(/\D/g, '').length >= 8) return 'phone'
  return null
}

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { prefs } = useUserSettings()
  const from = (location.state as { from?: string } | null)?.from
  const [step, setStep] = useState<AuthStep>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [slide, setSlide] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % backgroundMedia.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const sendCode = useCallback((showStep = true) => {
    setError('')
    if (!detectMethod(identifier)) {
      setError('Enter a valid email or mobile number')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (showStep) setStep('code')
      setResendCooldown(30)
      setCode('')
    }, 800)
  }, [identifier])

  const verifyCode = useCallback((enteredCode: string) => {
    if (loading) return
    setError('')
    const method = detectMethod(identifier)
    if (!method || enteredCode.replace(/\D/g, '').length < 6) {
      setError('Enter the 6-digit code we sent')
      return
    }
    setLoading(true)
    setTimeout(() => {
      login(identifier.trim(), method)
      const dest = !prefs.onboardingCompleted
        ? '/onboarding'
        : from && from !== '/auth'
          ? from
          : '/feed'
      navigate(dest, { replace: true })
    }, 600)
  }, [identifier, login, navigate, prefs.onboardingCompleted, from, loading])

  const [bgSrc, setBgSrc] = useState(backgroundMedia[0].src)

  useEffect(() => {
    setBgSrc(backgroundMedia[slide].src)
  }, [slide])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={slide}
            src={bgSrc}
            alt=""
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="h-full w-full object-cover"
            onError={() => setBgSrc(media.concert)}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75" />
      </div>

      <div className="absolute bottom-8 left-8 right-8 hidden max-w-lg lg:block">
        <TypewriterText text={backgroundMedia[slide].tagline} />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link
            to="/feed"
            className="mb-4 inline-block text-sm text-white/70 hover:text-white"
          >
            ← Back to browsing
          </Link>

          <div className="rounded-2xl border border-white/20 bg-black/45 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            {step === 'identifier' ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <h1 className="text-2xl font-bold tracking-tight">Let&apos;s get you in</h1>
                <p className="text-sm text-white/60">Sign in with your email or mobile number</p>
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email or mobile number"
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3.5 text-base text-white outline-none placeholder:text-white/35 focus:border-[#0a84ff]/50 focus:ring-2 focus:ring-[#0a84ff]/25"
                />
                {error && <p className="text-sm text-[#ff453a]">{error}</p>}
                <button
                  type="button"
                  disabled={loading || !identifier.trim()}
                  onClick={() => sendCode(true)}
                  className="w-full rounded-xl bg-[#0a84ff] py-3.5 text-base font-semibold text-white hover:bg-[#0070e0] disabled:opacity-40"
                >
                  {loading ? 'Sending…' : 'Continue'}
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Enter your code</h1>
                  <p className="mt-1 text-sm text-white/60">Sent to {identifier}</p>
                </div>
                <OtpInput
                  value={code}
                  onChange={setCode}
                  onComplete={verifyCode}
                  disabled={loading}
                />
                {loading && <p className="text-center text-sm text-white/50">Verifying…</p>}
                {error && <p className="text-center text-sm text-[#ff453a]">{error}</p>}
                <p className="text-center text-sm text-white/45">
                  Didn&apos;t get it?{' '}
                  <button
                    type="button"
                    disabled={loading || resendCooldown > 0}
                    onClick={() => sendCode(false)}
                    className="text-[#0a84ff] disabled:text-white/30"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('identifier')
                    setCode('')
                    setError('')
                  }}
                  className="w-full py-2 text-sm text-white/45 hover:text-white/70"
                >
                  Use a different email or number
                </button>
              </motion.div>
            )}

            <div className="mt-6 border-t border-white/10 pt-6">
              <MobileAppPromo variant="compact" />
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-white/40 lg:hidden">{backgroundMedia[slide].tagline}</p>
        </div>
      </div>
    </div>
  )
}
