import { useEffect, useState } from 'react'

type TypewriterTextProps = {
  text: string
  speed?: number
  className?: string
}

export function TypewriterText({ text, speed = 42, className = '' }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    setDisplayed('')
    let index = 0
    const typeTimer = setInterval(() => {
      index += 1
      setDisplayed(text.slice(0, index))
      if (index >= text.length) clearInterval(typeTimer)
    }, speed)
    return () => clearInterval(typeTimer)
  }, [text, speed])

  useEffect(() => {
    const blinkTimer = setInterval(() => setShowCursor((v) => !v), 530)
    return () => clearInterval(blinkTimer)
  }, [])

  return (
    <p className={`text-center text-[22px] font-semibold leading-snug tracking-tight text-white/90 ${className}`}>
      {displayed}
      <span className={showCursor ? 'opacity-90' : 'opacity-0'}>|</span>
    </p>
  )
}
