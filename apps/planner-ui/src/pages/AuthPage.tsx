import { media } from '../data/media'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { TypewriterText } from '../components/ui/TypewriterText'
import { OtpInput } from '../components/ui/OtpInput'

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
  const { login } = useAuth()
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
      navigate('/onboarding', { replace: true })
    }, 600)
  }, [identifier, login, navigate])

  const current = backgroundMedia[slide]

  return (
    <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-black ios-mesh-bg">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0"
          >
            <img src={current.src} alt="" className="h-full w-full object-cover opacity-60" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-6 pb-[max(env(safe-area-inset-bottom,0px),32px)]">
        <div className="flex flex-1 items-center justify-center px-2 pt-[max(env(safe-area-inset-top,0px),24px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="max-w-[280px]"
            >
              <TypewriterText text={current.tagline} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="shrink-0">
          {step === 'identifier' ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h1 className="ios-large-title">Let&apos;s get you in</h1>
              <p className="ios-subhead !text-white/55">Sign in with your email or mobile number</p>
              <input
                type="text"
                inputMode="email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or mobile number"
                className="w-full rounded-[16px] border-0 bg-white/10 px-4 py-4 text-[17px] text-white outline-none backdrop-blur-2xl placeholder:text-white/35 focus:ring-2 focus:ring-[#0a84ff]/40"
                style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset' }}
              />
              {error && <p className="text-[13px] text-[#ff453a]">{error}</p>}
              <button
                type="button"
                disabled={loading || !identifier.trim()}
                onClick={() => sendCode(true)}
                className="ios-button w-full py-4 text-[17px] disabled:opacity-40"
              >
                {loading ? 'Sending…' : 'Continue'}
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <h1 className="ios-large-title">Enter your code</h1>
                <p className="mt-1 ios-subhead !text-white/55">Sent to {identifier}</p>
              </div>
              <OtpInput
                value={code}
                onChange={setCode}
                onComplete={verifyCode}
                disabled={loading}
              />
              {loading && <p className="text-center text-[13px] text-white/50">Verifying…</p>}
              {error && <p className="text-center text-[13px] text-[#ff453a]">{error}</p>}
              <p className="text-center text-[13px] text-white/45">
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
                className="w-full py-2 text-[15px] text-white/45"
              >
                Use a different email or number
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
