import { useEffect, useRef } from 'react'

const LENGTH = 6

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onComplete: (value: string) => void
  disabled?: boolean
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '')

  useEffect(() => {
    if (value.length === LENGTH) {
      onComplete(value)
    }
  }, [value, onComplete])

  const updateAt = (index: number, nextDigit: string) => {
    const clean = nextDigit.replace(/\D/g, '').slice(-1)
    const chars = digits.slice()
    chars[index] = clean
    const joined = chars.join('').replace(/\D/g, '').slice(0, LENGTH)
    onChange(joined)
    if (clean && index < LENGTH - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (pasted: string) => {
    const clean = pasted.replace(/\D/g, '').slice(0, LENGTH)
    if (!clean) return
    onChange(clean)
    const focusIndex = Math.min(clean.length, LENGTH - 1)
    refs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex justify-center gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => updateAt(index, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digit && index > 0) {
              const chars = digits.slice()
              chars[index - 1] = ''
              onChange(chars.join(''))
              refs.current[index - 1]?.focus()
            }
          }}
          onPaste={(e) => {
            e.preventDefault()
            handlePaste(e.clipboardData.getData('text'))
          }}
          onFocus={(e) => e.target.select()}
          className="h-[52px] w-[44px] rounded-[14px] border-0 bg-white/10 text-center text-[22px] font-semibold text-white outline-none backdrop-blur-2xl focus:ring-2 focus:ring-[#0a84ff]/40 disabled:opacity-50"
          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset' }}
        />
      ))}
    </div>
  )
}
